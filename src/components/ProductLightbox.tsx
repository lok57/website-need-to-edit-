import { useState } from 'react';
import { X, Heart, ShoppingBag, ChevronRight, ChevronLeft, Share2, Bell, Facebook, Twitter, Link as LinkIcon, Edit2, Save } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import Toast from './Toast';
import SizeSelector from './SizeSelector';

interface ProductLightboxProps {
  product: Product | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
  onAddToCart: (product: Product, size: string) => void;
  onAddToWaitlist: (product: Product, email: string, size: string) => void;
  isAdmin?: boolean;
  onUpdate?: (product: Product) => void;
}

export default function ProductLightbox({ 
  product, 
  onClose,
  onPrevious,
  onNext,
  showNavigation = false,
  onAddToCart,
  onAddToWaitlist,
  isAdmin,
  onUpdate
}: ProductLightboxProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product | null>(product);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  // Get all media URLs (including legacy image property for backward compatibility)
  const mediaUrls = product.media?.length 
    ? product.media.map(m => m.url)
    : product.image 
      ? [product.image] 
      : ['https://via.placeholder.com/400'];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setToastMessage('Please select a size');
      setShowToast(true);
      return;
    }
    onAddToCart(product, selectedSize);
    setToastMessage('Added to cart successfully!');
    setShowToast(true);
  };

  const handleAddToWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      setToastMessage('Please select a size');
      setShowToast(true);
      return;
    }
    if (!email) {
      setToastMessage('Please enter your email');
      setShowToast(true);
      return;
    }
    onAddToWaitlist(product, email, selectedSize);
    setToastMessage('Added to waitlist successfully!');
    setShowToast(true);
    setShowWaitlistForm(false);
    setEmail('');
  };

  const handleShare = async (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const text = `Check out ${product.name} - ${product.description}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setToastMessage('Link copied to clipboard!');
          setShowToast(true);
        } catch (err) {
          setToastMessage('Failed to copy link');
          setShowToast(true);
        }
        break;
    }
    setShowShareMenu(false);
  };

  const handleSave = () => {
    if (editedProduct && onUpdate) {
      onUpdate(editedProduct);
      setToastMessage('Product updated successfully');
      setShowToast(true);
      setIsEditing(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((current) => (current + 1) % mediaUrls.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((current) => (current - 1 + mediaUrls.length) % mediaUrls.length);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
          <div className="absolute right-4 top-4 z-10 flex space-x-2">
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-black text-white p-2 hover:bg-gray-800 transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
            {isAdmin && isEditing && (
              <button
                onClick={handleSave}
                className="rounded-full bg-black text-white p-2 hover:bg-gray-800 transition-colors"
              >
                <Save className="h-5 w-5" />
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
                aria-label="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Facebook className="mr-3 h-4 w-4" />
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Twitter className="mr-3 h-4 w-4" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LinkIcon className="mr-3 h-4 w-4" />
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/90 p-2 hover:bg-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {showNavigation && (
            <>
              <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 hover:bg-white transition-colors shadow-lg"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2">
              <div className="relative aspect-square">
                {isEditing ? (
                  <div className="p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={editedProduct?.media?.[currentImageIndex]?.url || ''}
                      onChange={(e) => {
                        if (editedProduct) {
                          const newMedia = [...(editedProduct.media || [])];
                          newMedia[currentImageIndex] = {
                            url: e.target.value,
                            type: 'image'
                          };
                          setEditedProduct({ ...editedProduct, media: newMedia });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={mediaUrls[currentImageIndex]}
                      alt={product.name}
                      className="h-full w-full object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none"
                    />
                    {mediaUrls.length > 1 && (
                      <>
                        <button
                          onClick={previousImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                          {mediaUrls.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {!isEditing && mediaUrls.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {mediaUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex 
                          ? 'border-accent-600' 
                          : 'border-transparent hover:border-accent-300'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-8 lg:w-1/2">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editedProduct?.name || ''}
                      onChange={(e) => setEditedProduct(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={typeof editedProduct?.price === 'string' 
                        ? parseFloat(editedProduct.price.replace(/[^0-9.-]+/g, '')) || ''
                        : editedProduct?.price || ''}
                      onChange={(e) => setEditedProduct(prev => prev ? {...prev, price: parseFloat(e.target.value) || 0} : null)}
                      className="w-full px-3 py-2 border rounded-md"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editedProduct?.description || ''}
                      onChange={(e) => setEditedProduct(prev => prev ? {...prev, description: e.target.value} : null)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editedProduct?.category || ''}
                      onChange={(e) => setEditedProduct(prev => prev ? {...prev, category: e.target.value} : null)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Watches">Watches</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Status
                    </label>
                    <select
                      value={editedProduct?.inStock ? 'true' : 'false'}
                      onChange={(e) => setEditedProduct(prev => prev ? {...prev, inStock: e.target.value === 'true'} : null)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">{product.category}</p>
                    <div className="flex flex-col mb-4">
                      <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                      <p className="text-xl font-semibold text-gray-900">{formatPrice(product.price)}</p>
                    </div>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Return Policy:</span> Only replacements are available for this item. No returns accepted.
                      </p>
                    </div>

                    <SizeSelector
                      sizes={product.sizes || ['XS', 'S', 'M', 'L', 'XL']}
                      selectedSize={selectedSize}
                      onSelect={setSelectedSize}
                    />
                  </div>

                  {!showWaitlistForm ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {product.inStock !== false ? (
                          <>
                            <button 
                              onClick={handleAddToCart}
                              className="flex items-center justify-center space-x-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
                            >
                              <ShoppingBag className="h-5 w-5" />
                              <span>Add to Cart</span>
                            </button>
                            <button 
                              onClick={() => setShowWaitlistForm(true)}
                              className="flex items-center justify-center space-x-2 border border-black text-black px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Bell className="h-5 w-5" />
                              <span>Notify Me</span>
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setShowWaitlistForm(true)}
                            className="col-span-2 flex items-center justify-center space-x-2 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
                          >
                            <Bell className="h-5 w-5" />
                            <span>Join Waitlist</span>
                          </button>
                        )}
                      </div>
                      <button className="w-full flex items-center justify-center space-x-2 border border-gray-300 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors">
                        <Heart className="h-5 w-5" />
                        <span>Add to Wishlist</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAddToWaitlist} className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
                      >
                        Join Waitlist
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowWaitlistForm(false)}
                        className="w-full border border-gray-300 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}