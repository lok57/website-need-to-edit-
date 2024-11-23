import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ParallaxProvider } from './contexts/ParallaxContext';
import { ProductProvider } from './contexts/ProductContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AdminProvider } from './contexts/AdminContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AdminProvider>
        <CartProvider>
          <ProductProvider>
            <ParallaxProvider>
              <App />
              <Toaster 
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                }}
              />
            </ParallaxProvider>
          </ProductProvider>
        </CartProvider>
      </AdminProvider>
    </AuthProvider>
  </React.StrictMode>
);