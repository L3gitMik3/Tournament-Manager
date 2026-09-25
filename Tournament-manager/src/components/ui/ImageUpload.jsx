import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { resolveImageUrl } from '../../utils/helpers';

const ImageUpload = ({ 
  onUploadComplete, 
  existingImage = null,
  label = 'Upload Image',
  className = '',
  imageFolder = null,
}) => {
  const [preview, setPreview] = useState(existingImage ? resolveImageUrl(existingImage, imageFolder) : null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(existingImage ? resolveImageUrl(existingImage, imageFolder) : null);
  }, [existingImage, imageFolder]);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onUploadComplete(file);
  };

  const removeImage = () => {
    setPreview(null);
    onUploadComplete(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Upload preview"
            className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{label}</p>
          <p className="text-sm text-gray-400 mt-1">
            PNG, JPG, GIF, WEBP (max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleFileSelect(file);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;