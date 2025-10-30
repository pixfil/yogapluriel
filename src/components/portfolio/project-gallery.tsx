"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedSection from "@/components/ui/animated-section";

interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  type: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
  order: number;
}

interface ProjectGalleryProps {
  images: ProjectImage[];
  title: string;
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  
  const getTypeLabel = (type: string) => {
    const labels = {
      'avant': 'Avant',
      'pendant': 'Pendant',
      'apres': 'Après',
      'detail': 'Détail',
      'gallery': 'Galerie'
    };
    return labels[type as keyof typeof labels] || type;
  };
  
  const getTypeColor = (type: string) => {
    const colors = {
      'avant': 'bg-red-500',
      'pendant': 'bg-orange-500', 
      'apres': 'bg-green-500',
      'detail': 'bg-blue-500',
      'gallery': 'bg-gray-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage > 0 ? selectedImage - 1 : sortedImages.length - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage < sortedImages.length - 1 ? selectedImage + 1 : 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedImage !== null) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    }
  };

  // Add keyboard listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Galerie du projet</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedImages.map((image, index) => (
            <AnimatedSection key={image.id} delay={0.1 * index}>
              <div 
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getTypeColor(image.type)}`}>
                      {getTypeLabel(image.type)}
                    </span>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Voir en grand</span>
                    </div>
                  </div>
                </div>
                
                {image.caption && (
                  <div className="p-3 bg-white">
                    <p className="text-sm text-gray-600">{image.caption}</p>
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative max-w-4xl max-h-[80vh] w-full">
            <Image
              src={sortedImages[selectedImage].url}
              alt={sortedImages[selectedImage].alt}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 rounded-b-lg">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(sortedImages[selectedImage].type)}`}>
                    {getTypeLabel(sortedImages[selectedImage].type)}
                  </span>
                  <span className="text-sm opacity-75">
                    {selectedImage + 1} / {sortedImages.length}
                  </span>
                </div>
                <p className="text-sm font-medium">{sortedImages[selectedImage].alt}</p>
                {sortedImages[selectedImage].caption && (
                  <p className="text-sm opacity-75 mt-1">{sortedImages[selectedImage].caption}</p>
                )}
              </div>
            </div>
          </div>

          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={closeLightbox}
          />
        </div>
      )}
    </>
  );
}