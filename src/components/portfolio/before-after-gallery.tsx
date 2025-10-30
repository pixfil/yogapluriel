"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  type: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
  order: number;
}

interface BeforeAfterGalleryProps {
  images: GalleryImage[];
  title: string;
}

export default function BeforeAfterGallery({ images, title }: BeforeAfterGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Grouper les images par type
  const avantImages = images.filter(img => img.type === 'avant').sort((a, b) => a.order - b.order);
  const pendantImages = images.filter(img => img.type === 'pendant').sort((a, b) => a.order - b.order);
  const apresImages = images.filter(img => img.type === 'apres').sort((a, b) => a.order - b.order);
  const detailImages = images.filter(img => img.type === 'detail' || img.type === 'gallery').sort((a, b) => a.order - b.order);

  // Images pour le lightbox (toutes)
  const allImages = [...avantImages, ...pendantImages, ...apresImages, ...detailImages];

  const openLightbox = (image: GalleryImage) => {
    const index = allImages.findIndex(img => img.id === image.id);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Gestion du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <div className="space-y-12">
      <h2 className="text-3xl font-bold text-center mb-8">Évolution du projet</h2>

      {/* Section Avant/Pendant/Après en grille */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avant */}
        {avantImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center py-2 bg-gray-100 rounded-lg">
              Avant
            </h3>
            <div className="space-y-4">
              {avantImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openLightbox(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold">
                      Agrandir
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pendant */}
        {pendantImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center py-2 bg-yellow/20 rounded-lg">
              Pendant
            </h3>
            <div className="space-y-4">
              {pendantImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openLightbox(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold">
                      Agrandir
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Après */}
        {apresImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center py-2 bg-green-100 rounded-lg">
              Après
            </h3>
            <div className="space-y-4">
              {apresImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openLightbox(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold">
                      Agrandir
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Photos détails supplémentaires (si présentes) */}
      {detailImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-center">Photos détails</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {detailImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(image)}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold">
                    Agrandir
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && allImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-yellow transition-colors z-10"
            aria-label="Fermer"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-4 text-white hover:text-yellow transition-colors z-10"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-4 text-white hover:text-yellow transition-colors z-10"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div
            className="relative max-w-6xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxIndex].url}
              alt={allImages[lightboxIndex].alt}
              width={1200}
              height={900}
              className="object-contain max-h-[90vh]"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
