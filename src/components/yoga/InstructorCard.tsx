'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface InstructorCardProps {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  specialties: string[];
  photoUrl?: string;
  yearsExperience?: number;
}

export function InstructorCard({
  id,
  firstName,
  lastName,
  bio,
  specialties,
  photoUrl,
  yearsExperience
}: InstructorCardProps) {
  const fullName = `${firstName} ${lastName}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link href={`/professeurs/${id}`} className="block">
        {/* Photo */}
        <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-4 bg-gradient-to-br from-purple-100 to-purple-50">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-4xl font-semibold">
                {firstName[0]}{lastName[0]}
              </div>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Experience badge */}
          {yearsExperience && (
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-purple-700">
              {yearsExperience} ans d'expérience
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
            {fullName}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {bio}
          </p>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2">
            {specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-100"
              >
                {specialty}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                +{specialties.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
