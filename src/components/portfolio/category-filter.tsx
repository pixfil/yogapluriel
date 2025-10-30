"use client";

import { useState } from "react";
import { Filter as FilterIcon } from "lucide-react";
import AnimatedSection from "@/components/ui/animated-section";
import type { Category } from "@/lib/supabase-queries";

interface CategoryFilterProps {
  onFilterChange: (categories: string[]) => void;
  activeCategories: string[];
  categories: Category[];
}

export default function CategoryFilter({ onFilterChange, activeCategories, categories }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Categories already have counts from server
  const categoriesWithCounts = categories.filter(category => category.count && category.count > 0);
  const totalProjects = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);

  const handleCategoryToggle = (categoryId: string) => {
    let newCategories: string[];
    
    if (categoryId === 'all') {
      newCategories = [];
    } else {
      if (activeCategories.includes(categoryId)) {
        newCategories = activeCategories.filter(id => id !== categoryId);
      } else {
        newCategories = [...activeCategories, categoryId];
      }
    }
    
    onFilterChange(newCategories);
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  const isAllActive = activeCategories.length === 0;

  return (
    <AnimatedSection>
      <div className="mb-12">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-gray-700 hover:bg-slate-200 transition-colors w-full justify-center"
          >
            <FilterIcon className="w-4 h-4" />
            <span>Filtrer par catégorie</span>
            {activeCategories.length > 0 && (
              <span className="bg-yellow text-black text-xs px-2 py-1 rounded-full">
                {activeCategories.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Buttons */}
        <div className={`flex flex-wrap justify-center gap-3 ${isOpen ? 'block' : 'hidden md:flex'}`}>
          {/* All Projects Button */}
          <button
            onClick={() => handleCategoryToggle('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              isAllActive
                ? 'bg-yellow text-black shadow-lg transform scale-105'
                : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
            }`}
          >
            <span>Tous les projets</span>
            <span className="text-xs opacity-75">({totalProjects})</span>
          </button>

          {/* Category Buttons */}
          {categoriesWithCounts.map((category) => {
            const isActive = activeCategories.includes(category.slug);
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryToggle(category.slug)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                }`}
                style={isActive ? { backgroundColor: category.color } : {}}
              >
                <span>{category.name}</span>
                <span className="text-xs opacity-75">({category.count})</span>
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary */}
        {activeCategories.length > 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {activeCategories.length} filtre{activeCategories.length > 1 ? 's' : ''} actif{activeCategories.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={clearFilters}
                className="text-xs text-yellow hover:text-yellow-600 underline"
              >
                Tout afficher
              </button>
            </div>
          </div>
        )}

        {/* Selected Categories Display */}
        {activeCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {activeCategories.map(categorySlug => {
              const category = categoriesWithCounts.find(cat => cat.slug === categorySlug);
              if (!category) return null;
              
              return (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                  <button
                    onClick={() => handleCategoryToggle(category.slug)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}