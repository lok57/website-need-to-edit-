import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import Toast from './Toast';

interface ImageUploadProps {
  currentImage: string;
  onImageChange: (imageUrl: string) => void;
}

export default function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImage);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    onImageChange(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToastMessage('Please upload an image file');
      setShowToast(true);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToastMessage('Image size should be less than 5MB');
      setShowToast(true);
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageUrl(base64String);
        onImageChange(base64String);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setToastMessage('Error uploading image');
      setShowToast(true);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Image
        </label>
        
        {/* Image Preview */}
        {imageUrl && (
          <div className="relative mb-4">
            <img
              src={imageUrl}
              alt="Product preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={() => {
                setImageUrl('');
                onImageChange('');
              }}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </span>
            <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
          </label>
        </div>

        {/* URL Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Or enter image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border rounded-md"
          />
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