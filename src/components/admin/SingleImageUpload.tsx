'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';

interface SingleImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (file: File | null) => void;
  onImageUrlChange?: (url: string) => void;
  bucket?: string;
  path?: string;
}

export default function SingleImageUpload({
  currentImageUrl,
  onImageChange,
  onImageUrlChange,
}: SingleImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onImageChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (onImageUrlChange) {
      onImageUrlChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div className="space-y-3">
      {/* Preview */}
      {displayImage && (
        <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border border-gray-200 group">
          <Image
            src={displayImage}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleClick}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-gray-700"
        >
          <Upload className="w-4 h-4" />
          {displayImage ? 'Changer l\'image' : 'Ajouter une image'}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Formats supportés : JPEG, PNG, WebP, GIF
        </p>
      </div>
    </div>
  );
}
