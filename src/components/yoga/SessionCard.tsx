'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SessionCardProps {
  id: string;
  className: string;
  instructorName: string;
  startTime: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  roomName: string;
  status: 'scheduled' | 'full' | 'cancelled';
  onBook?: () => void;
}

export function SessionCard({
  id,
  className,
  instructorName,
  startTime,
  duration,
  maxParticipants,
  currentParticipants,
  roomName,
  status,
  onBook
}: SessionCardProps) {
  const availableSpots = maxParticipants - currentParticipants;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;
  const isFull = status === 'full' || availableSpots === 0;
  const isCancelled = status === 'cancelled';

  const getStatusColor = () => {
    if (isCancelled) return 'bg-red-100 text-red-700 border-red-200';
    if (isFull) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (isAlmostFull) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusText = () => {
    if (isCancelled) return 'Annulé';
    if (isFull) return 'Complet';
    if (isAlmostFull) return `${availableSpots} places`;
    return `${availableSpots} places`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{className}</h4>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {instructorName}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Time & Location */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{startTime} • {duration}min</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{roomName}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>{currentParticipants}/{maxParticipants} participants</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isFull ? 'bg-gray-400' : isAlmostFull ? 'bg-orange-500' : 'bg-purple-600'
            }`}
            style={{ width: `${(currentParticipants / maxParticipants) * 100}%` }}
          />
        </div>
      </div>

      {/* Action button */}
      <Button
        onClick={onBook}
        disabled={isFull || isCancelled}
        className="w-full"
        variant={isFull || isCancelled ? 'outline' : 'default'}
      >
        {isCancelled ? 'Annulé' : isFull ? 'Complet' : 'Réserver'}
      </Button>
    </motion.div>
  );
}
