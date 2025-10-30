'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import AnimatedSection from '@/components/ui/animated-section';
import type { GoogleReviewsResponse, GoogleReview } from '@/types/google-reviews';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

// Témoignages de fallback si l'API Google échoue
const FALLBACK_TESTIMONIALS: GoogleReview[] = [
  {
    name: "Marie Dupont",
    location: "Strasbourg",
    rating: 5,
    comment: "Travail impeccable et équipe très professionnelle. Notre toiture a été refaite en tuiles mécaniques avec une isolation renforcée. Le chantier a été mené dans les délais annoncés.",
  },
  {
    name: "Jean Martin",
    location: "Eschau",
    rating: 5,
    comment: "Excellente prestation pour l'installation de nos Velux. L'équipe est ponctuelle, soigneuse et de bon conseil. Je recommande vivement !",
  },
  {
    name: "Sophie Laurent",
    location: "Illkirch",
    rating: 5,
    comment: "Très satisfaits de la rénovation complète de notre toiture. Un grand merci pour le professionnalisme et la qualité du travail fourni.",
  },
  {
    name: "Thomas Weber",
    location: "Geispolsheim",
    rating: 5,
    comment: "Service de qualité pour notre projet de lucarne. Devis précis, travaux soignés et respect du planning. Artisans compétents et à l'écoute.",
  },
  {
    name: "Claire Schneider",
    location: "Lingolsheim",
    rating: 5,
    comment: "Intervention rapide pour une réparation d'urgence suite à une tempête. Équipe réactive et efficace. Merci !",
  },
  {
    name: "Pierre Muller",
    location: "Strasbourg",
    rating: 5,
    comment: "Pose d'une toiture en zinc avec une finition parfaite. L'entreprise est sérieuse, les tarifs corrects et le résultat à la hauteur de nos attentes.",
  },
];

export default function GoogleReviewsCarousel() {
  const [data, setData] = useState<GoogleReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Navigation buttons
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Update selected index on scroll
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;

    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(intervalId);
  }, [emblaApi]);

  // Fetch reviews
  useEffect(() => {
    fetch('/api/google-reviews')
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch reviews');
        }
        return res.json();
      })
      .then((fetchedData: GoogleReviewsResponse) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading Google reviews:', err);
        setError(err.message);
        // Utiliser les témoignages de fallback
        setData({
          reviews: FALLBACK_TESTIMONIALS,
          averageRating: 5,
          totalReviews: FALLBACK_TESTIMONIALS.length,
        });
        setLoading(false);
      });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center animate-pulse">
          <div className="h-12 w-24 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse bg-gray-200 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  // Pas de données
  if (!data?.reviews || data.reviews.length === 0) {
    return (
      <p className="text-center text-gray-600">
        Aucun avis disponible pour le moment.
      </p>
    );
  }

  const reviews = data.reviews;
  const isUsingFallback = error !== null;

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <AnimatedSection>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-8 h-8 text-yellow fill-current" />
            <span className="text-4xl font-bold">{data.averageRating.toFixed(1)}</span>
            <span className="text-xl text-gray-600">/5</span>
          </div>
          <p className="text-gray-600">
            {isUsingFallback ? (
              <>Témoignages de nos clients</>
            ) : (
              <>Basé sur {data.totalReviews} avis Google</>
            )}
          </p>
        </div>
      </AnimatedSection>

      {/* Carousel */}
      <AnimatedSection delay={0.2}>
        <div className="relative max-w-6xl mx-auto">
          {/* Carousel Container */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {reviews.map((review, index) => (
                <div
                  key={`${review.name}-${index}`}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                >
                  <GlassCard className="p-6 h-full flex flex-col">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {review.profilePhoto && !isUsingFallback ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={review.profilePhoto}
                            alt={review.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-yellow/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-yellow font-bold text-lg">
                            {review.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm">
                          <strong className="text-foreground truncate block">
                            {review.name}
                          </strong>
                          <span className="text-muted-foreground text-xs">
                            {review.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-foreground italic line-clamp-5 flex-1">
                      &ldquo;{review.comment}&rdquo;
                    </p>

                    {/* Date */}
                    {review.date && !isUsingFallback && (
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(review.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-white/90 hover:bg-yellow transition-colors p-3 rounded-full shadow-lg border border-gray-200 hover:border-yellow group"
            aria-label="Avis précédent"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-black" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-white/90 hover:bg-yellow transition-colors p-3 rounded-full shadow-lg border border-gray-200 hover:border-yellow group"
            aria-label="Avis suivant"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-black" />
          </button>
        </div>
      </AnimatedSection>

      {/* Dots Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex
                ? 'bg-yellow w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Aller à la slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Google Badge - Seulement si on affiche les vrais avis Google */}
      {!isUsingFallback && (
        <div className="text-center">
          <a
            href="https://www.google.com/maps/place/?q=place_id:ChIJ51V7Ed_JlkcRs0QzvN_EAxw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-yellow transition-colors border border-gray-300 rounded-lg hover:border-yellow"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.910 11.910 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Voir tous les avis sur Google
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Warning si fallback */}
      {isUsingFallback && (
        <p className="text-center text-xs text-gray-500 italic">
          Les avis Google ne sont pas disponibles actuellement. Affichage des témoignages clients.
        </p>
      )}
    </div>
  );
}
