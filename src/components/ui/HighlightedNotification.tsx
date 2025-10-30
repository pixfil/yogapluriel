"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Hammer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load modal pour économiser bundle
const JobApplicationModal = dynamic(() => import('./JobApplicationModal'), {
  ssr: false,
});

interface HighlightedNotificationProps {
  type: 'project' | 'job';
  title: string;
  slug?: string;
  id?: string;
  description?: string;
  image?: string;
  index?: number; // Pour l'empilement
}

export default function HighlightedNotification({
  type,
  title,
  slug,
  id,
  description,
  image,
  index = 0
}: HighlightedNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const router = useRouter();

  // Storage key based on type and id/slug
  const storageKey = `dismissed-${type}-${slug || id}`;

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after a short delay (stagger if multiple)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000 + (index * 300));

    return () => clearTimeout(timer);
  }, [storageKey, index]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  const handleProjectClick = () => {
    if (type === 'project' && slug) {
      handleDismiss(); // Fermer la popup d'abord
      router.push(`/nos-realisations/${slug}`);
    }
  };

  const handleJobClick = () => {
    if (type === 'job' && id) {
      setShowJobModal(true);
    }
  };

  if (isDismissed) return null;

  const icon = type === 'project' ? Hammer : Briefcase;
  const Icon = icon;

  const message = type === 'project'
    ? 'Nouveau projet réalisé !'
    : 'On recrute !';

  // Utiliser la charte graphique
  const bgColor = type === 'project'
    ? 'bg-yellow' // Jaune de la charte
    : 'bg-black/70 backdrop-blur-md border border-yellow/40'; // Fond noir semi-transparent avec bordure jaune

  const textColor = type === 'project'
    ? 'text-black' // Texte noir sur jaune
    : 'text-white'; // Texte blanc sans ombre (fond sombre suffit)

  // Position en bas à gauche, empilées verticalement si plusieurs
  // Jobs au-dessus des projets : si index=0 (job en premier), mettre plus haut
  // Si projet existe (index=1 pour job), ajouter la hauteur du projet + marge
  const baseOffset = 24;
  let bottomOffset = baseOffset;

  if (type === 'job') {
    // Job notification toujours plus haute (au-dessus du projet)
    // Ajouter 340px (hauteur projet ~300px + marge 40px) si projet existe
    bottomOffset = baseOffset + (index === 0 ? 0 : 340);
  } else {
    // Project notification toujours en bas
    bottomOffset = baseOffset;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          className="fixed left-6 z-50"
          style={{ bottom: `${bottomOffset}px` }}
        >
          <div className={`${bgColor} ${textColor} rounded-lg ${type === 'project' ? 'max-w-md shadow-2xl' : 'max-w-sm shadow-[0_8px_30px_rgba(0,0,0,0.5)]'} overflow-hidden`}>
            {/* Image pour les projets */}
            {type === 'project' && image && (
              <div className="relative w-full h-32 bg-gray-200">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold mb-1">
                    {message}
                  </p>
                  <p className={`text-base font-semibold mb-2 ${type === 'project' ? 'text-gray-900' : ''}`}>
                    {title}
                  </p>

                  {/* Description pour les projets */}
                  {type === 'project' && description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {description}
                    </p>
                  )}

                  {type === 'project' ? (
                    <button
                      onClick={handleProjectClick}
                      className="inline-block px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-black text-white hover:bg-gray-800"
                    >
                      Découvrir →
                    </button>
                  ) : (
                    <button
                      onClick={handleJobClick}
                      className="inline-block px-4 py-2 rounded-md text-sm font-semibold transition-colors bg-yellow text-black hover:bg-yellow/90 [text-shadow:none]"
                    >
                      Postuler →
                    </button>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className={`flex-shrink-0 p-1 rounded transition-colors ${
                    type === 'project'
                      ? 'hover:bg-black/10 text-gray-700'
                      : 'hover:bg-yellow/20 text-white hover:text-yellow'
                  }`}
                  aria-label="Fermer la notification"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Job Application Modal */}
      {type === 'job' && id && showJobModal && (
        <JobApplicationModal
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          jobId={id}
          jobTitle={title}
        />
      )}
    </AnimatePresence>
  );
}
