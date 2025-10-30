"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  Star, 
  StarOff, 
  GripVertical,
  Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import imageCompression from 'browser-image-compression';

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  description: string;
  isMain: boolean;
  order: number;
  imageType?: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
  isUploading?: boolean;
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  className?: string;
  galleryLayout?: 'grid' | 'before-after';
}

interface SortableImageItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onSetMain: (id: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onImageTypeChange: (id: string, imageType: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery') => void;
  galleryLayout?: 'grid' | 'before-after';
}

function SortableImageItem({
  image,
  onRemove,
  onSetMain,
  onDescriptionChange,
  onImageTypeChange,
  galleryLayout
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white rounded-lg border border-gray-200 p-4 ${
        isDragging ? 'shadow-lg' : 'shadow-sm hover:shadow-md'
      } transition-shadow`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing p-1 rounded bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(image.id)}
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Main Image Toggle */}
      <button
        onClick={() => onSetMain(image.id)}
        className={`absolute top-2 right-10 z-10 p-1 rounded-full transition-colors ${
          image.isMain
            ? 'bg-yellow text-black'
            : 'bg-gray-200 text-gray-500 hover:bg-yellow hover:text-black'
        }`}
        type="button"
        title={image.isMain ? 'Image principale' : 'Définir comme image principale'}
      >
        {image.isMain ? (
          <Star className="w-4 h-4 fill-current" />
        ) : (
          <StarOff className="w-4 h-4" />
        )}
      </button>

      {/* Image Preview */}
      <div className="relative aspect-video mb-3 rounded-md overflow-hidden bg-gray-100">
        {image.isUploading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow"></div>
          </div>
        ) : (
          <Image
            src={image.url}
            alt={image.description || 'Image du projet'}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Image Type Selector (only for before-after layout) */}
      {galleryLayout === 'before-after' && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Type d'image
          </label>
          <select
            value={image.imageType || 'detail'}
            onChange={(e) => onImageTypeChange(image.id, e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow focus:border-yellow"
          >
            <option value="avant">🟦 Avant</option>
            <option value="pendant">🟨 Pendant</option>
            <option value="apres">🟩 Après</option>
            <option value="detail">⬜ Détail</option>
          </select>
        </div>
      )}

      {/* Description Input */}
      <input
        type="text"
        placeholder="Description de l'image..."
        value={image.description}
        onChange={(e) => onDescriptionChange(image.id, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow focus:border-yellow"
      />

      {/* Type Badge */}
      {galleryLayout === 'before-after' && image.imageType && (
        <div className="absolute top-2 right-20">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            image.imageType === 'avant' ? 'bg-blue-500 text-white' :
            image.imageType === 'pendant' ? 'bg-yellow text-black' :
            image.imageType === 'apres' ? 'bg-green-500 text-white' :
            'bg-gray-300 text-gray-700'
          }`}>
            {image.imageType === 'avant' ? 'Avant' :
             image.imageType === 'pendant' ? 'Pendant' :
             image.imageType === 'apres' ? 'Après' : 'Détail'}
          </span>
        </div>
      )}

      {/* Order indicator */}
      <div className="absolute bottom-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
        {image.order}
      </div>
    </div>
  );
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  className = '',
  galleryLayout = 'grid'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const compressImage = async (file: File): Promise<File> => {
    // Essayer d'abord avec WebP
    const optionsWebP = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp' as const,
    };

    try {
      const compressed = await imageCompression(file, optionsWebP);
      console.log(`Image compressée : ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
      return compressed;
    } catch (webpError) {
      console.warn('WebP compression failed, trying JPEG fallback:', webpError);

      // Fallback: compression JPEG sans conversion
      try {
        const optionsJPEG = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: false, // Désactiver web worker en fallback
        };
        const compressed = await imageCompression(file, optionsJPEG);
        console.log(`Image compressée (JPEG fallback) : ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
        return compressed;
      } catch (jpegError) {
        console.error('All compression methods failed:', jpegError);
        console.log('Using original file without compression');
        return file; // Retourner l'original si tout échoue
      }
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const currentImages = images ?? [];
    if (currentImages.length + acceptedFiles.length > maxImages) {
      alert(`Vous ne pouvez ajouter que ${maxImages} images maximum`);
      return;
    }

    setIsUploading(true);

    const newImages: ImageFile[] = [];

    for (const file of acceptedFiles) {
      const compressedFile = await compressImage(file);
      const id = `temp-${Date.now()}-${Math.random()}`;
      const url = URL.createObjectURL(compressedFile);

      newImages.push({
        id,
        file: compressedFile,
        url,
        description: '',
        isMain: currentImages.length === 0 && newImages.length === 0, // First image is main
        order: currentImages.length + newImages.length + 1,
        imageType: galleryLayout === 'before-after' ? 'detail' : 'gallery',
        isUploading: true,
      });
    }

    // Add new images to the list
    const updatedImages = [...currentImages, ...newImages];
    onImagesChange(updatedImages);

    // Simulate upload delay (replace with actual upload logic)
    setTimeout(() => {
      const finalImages = updatedImages.map(img => ({
        ...img,
        isUploading: false,
      }));
      onImagesChange(finalImages);
      setIsUploading(false);
    }, 1000);
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: maxImages,
    disabled: isUploading || (images?.length ?? 0) >= maxImages,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!images || !over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);

    const reorderedImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    onImagesChange(reorderedImages);
  };

  const removeImage = (id: string) => {
    if (!images) return;

    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({
        ...img,
        order: index + 1,
        // If we removed the main image and there are others, make the first one main
        isMain: img.isMain || (images.find(i => i.id === id)?.isMain && index === 0),
      }));

    onImagesChange(updatedImages);
  };

  const setMainImage = (id: string) => {
    if (!images) return;

    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === id,
    }));

    onImagesChange(updatedImages);
  };

  const updateImageDescription = (id: string, description: string) => {
    if (!images) return;

    const updatedImages = images.map(img =>
      img.id === id ? { ...img, description } : img
    );

    onImagesChange(updatedImages);
  };

  const updateImageType = (id: string, imageType: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery') => {
    if (!images) return;

    const updatedImages = images.map(img =>
      img.id === id ? { ...img, imageType } : img
    );

    onImagesChange(updatedImages);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Drop Zone */}
      {(images?.length ?? 0) < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive
              ? 'border-yellow bg-yellow/5'
              : 'border-gray-300 hover:border-yellow hover:bg-yellow/5'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            {isUploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow mb-4"></div>
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
            )}
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Déposez vos images ici...' : 'Ajoutez des images'}
            </p>
            <p className="text-sm text-gray-500">
              Glissez-déposez ou cliquez pour sélectionner ({images?.length ?? 0}/{maxImages})
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Formats supportés : JPEG, PNG, WebP, GIF (max 1MB chacune)
            </p>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {(images?.length ?? 0) > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Images du projet ({images?.length ?? 0})
          </h3>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    onRemove={removeImage}
                    onSetMain={setMainImage}
                    onDescriptionChange={updateImageDescription}
                    onImageTypeChange={updateImageType}
                    galleryLayout={galleryLayout}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <p className="text-sm text-gray-500">
            💡 Glissez-déposez pour réorganiser. L'étoile jaune indique l'image principale.
          </p>
        </div>
      )}
    </div>
  );
}