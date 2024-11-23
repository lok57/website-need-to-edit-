import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { fetchUserProfile, updateUserProfile, createUserProfile } from '../services/firebase/userProfile';
import { UserProfile } from '../types/auth';
import toast from 'react-hot-toast';

// Enable persistent auth state
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error enabling auth persistence:', error);
});

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
  isOffline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await fetchUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (!isOffline) {
            toast.error('Unable to load profile');
          }
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [isOffline]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(result.user.uid);
      if (profile) {
        setUserProfile(profile);
      }
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to login');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await createUserProfile(user.uid, {
        name,
        email,
        phone: '',
        createdAt: new Date().toISOString()
      });

      const profile = await fetchUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
      toast.success('Successfully registered!');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await updateUserProfile(currentUser.uid, data);
      const updatedProfile = await fetchUserProfile(currentUser.uid);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      if (!isOffline) {
        toast.error('Failed to update profile');
      }
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser?.email) {
      throw new Error('No user logged in');
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await firebaseUpdatePassword(currentUser, newPassword);
      
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password');
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      await createUserProfile(user.uid, {
        name: user.displayName || undefined,
        email: user.email!,
        phone: '',
        photoURL: user.photoURL || undefined
      });
      
      const profile = await fetchUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
      toast.success('Successfully signed in with Google!');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send reset email');
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    googleSignIn,
    resetPassword,
    updateProfile,
    updatePassword,
    loading,
    isOffline
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}