import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

// Import project data for categories
import projectsData from "@/lib/projects-data.json";

interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  date: string;
  category: string[];
  mainImage: string;
  description: string;
  featured: boolean;
}

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  // Get project categories for display
  const projectCategories = project.category.map(catId => 
    projectsData.categories.find(cat => cat.id === catId)
  ).filter(Boolean);

  const mainCategory = projectCategories[0];

  return (
    <Link href={`/nos-realisations/${project.slug}`}>
      <GlassCard hover className="group overflow-hidden h-full">
        <div className="relative h-64 overflow-hidden">
          {project.mainImage ? (
            <Image
              src={project.mainImage}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Pas d'image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Category Badge */}
          {mainCategory && (
            <div className="absolute top-4 left-4">
              <span 
                className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: mainCategory.color }}
              >
                {mainCategory.name}
              </span>
            </div>
          )}
          
          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 bg-yellow text-black text-xs font-semibold rounded-full">
                À la une
              </span>
            </div>
          )}
          
          {/* Location & Date */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{project.date}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 group-hover:text-yellow transition-colors line-clamp-2">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="text-gray-500 text-sm mb-3 italic">
              {project.subtitle}
            </p>
          )}
          <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
            {project.description}
          </p>
          
          {/* Categories */}
          {projectCategories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {projectCategories.slice(1).map((category) => category && (
                <span 
                  key={category.id}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center text-yellow font-semibold group-hover:gap-3 transition-all">
            <span>Voir le détail</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}