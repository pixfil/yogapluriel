'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PricingCardProps {
  name: string;
  planType: 'unlimited' | 'credit_based' | 'time_based';
  price: number;
  credits?: number;
  durationDays?: number;
  features: string[];
  isPopular?: boolean;
  onSelect?: () => void;
}

export function PricingCard({
  name,
  planType,
  price,
  credits,
  durationDays,
  features,
  isPopular,
  onSelect
}: PricingCardProps) {
  const getPlanTypeLabel = () => {
    switch (planType) {
      case 'unlimited': return 'Illimité';
      case 'credit_based': return `${credits} cours`;
      case 'time_based': return `${Math.floor((durationDays || 0) / 30)} mois`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl p-8 ${
        isPopular
          ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl scale-105'
          : 'bg-white text-gray-900 shadow-lg'
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-yellow-400 text-purple-900 text-sm font-semibold">
          Le plus populaire
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
          {name}
        </h3>
        <div className={`text-sm mb-4 ${isPopular ? 'text-purple-100' : 'text-gray-600'}`}>
          {getPlanTypeLabel()}
        </div>
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-5xl font-bold ${isPopular ? 'text-white' : 'text-purple-600'}`}>
            {price}
          </span>
          <span className={`text-lg ${isPopular ? 'text-purple-100' : 'text-gray-600'}`}>
            €
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-purple-200' : 'text-purple-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className={`text-sm ${isPopular ? 'text-purple-50' : 'text-gray-600'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        onClick={onSelect}
        className={`w-full ${
          isPopular
            ? 'bg-white text-purple-600 hover:bg-purple-50'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        Choisir ce forfait
      </Button>
    </motion.div>
  );
}
