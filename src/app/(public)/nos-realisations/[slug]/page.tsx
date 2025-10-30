import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/ui/page-hero";
import AnimatedSection from "@/components/ui/animated-section";
import GlassCard from "@/components/ui/glass-card";
import CTAButton from "@/components/ui/cta-button";
import ProjectGallery from "@/components/portfolio/project-gallery";
import BeforeAfterGallery from "@/components/portfolio/before-after-gallery";
import { createClient, getAdminClient } from "@/lib/supabase-server";
import type { Project, Category, ProjectWithDetails } from "@/types/supabase";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Phone,
  ChevronRight
} from "lucide-react";

// ISR: Revalider toutes les 24h (contenu projet rarement modifié)
export const revalidate = 86400; // 24 heures

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Get project from Supabase
async function getProject(slug: string): Promise<ProjectWithDetails | null> {
  const supabase = getAdminClient();
  
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images(id, url, alt, type, order_index),
        project_categories(category_id)
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !project) {
      console.error('[getProject] Error or no project found:', error);
      return null;
    }

    console.log('[getProject] Project found:', project.slug);
    console.log('[getProject] Project images:', project.project_images);
    console.log('[getProject] Images count:', project.project_images?.length || 0);

    // Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug');

    const categoryMap = new Map<string, Category>(
      (categories as Category[])?.map(cat => [cat.id, cat]) || []
    );

    // Transform data to match frontend expectations
    const projectData = project as Project;
    const gallery = projectData.project_images
      ?.sort((a, b) => a.order_index - b.order_index)
      .map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt || projectData.title,
        type: 'gallery' as const,
        order: img.order_index
      })) || [];

    return {
      ...projectData,
      mainImage: projectData.main_image,
      gallery,
      category: projectData.project_categories?.map(pc => categoryMap.get(pc.category_id)?.slug).filter((slug): slug is string => Boolean(slug)) || [],
      projectCategories: projectData.project_categories?.map(pc => categoryMap.get(pc.category_id)).filter((cat): cat is Category => Boolean(cat)) || [],
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Get related projects
async function getRelatedProjects(projectId: string, categoryIds: string[], limit: number = 3): Promise<Project[]> {
  const supabase = await createClient();
  
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        slug,
        location,
        date,
        project_images!inner(url, type, order_index),
        project_categories!inner(category_id)
      `)
      .neq('id', projectId)
      .eq('published', true)
      .in('project_categories.category_id', categoryIds)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error || !projects) {
      return [];
    }

    return projects.map(project => {
      const projectData = project as Project;
      return {
        ...projectData,
        mainImage: projectData.main_image || projectData.project_images?.[0]?.url
      };
    });
  } catch (error) {
    console.error('Error fetching related projects:', error);
    return [];
  }
}

// Generate static paths for all projects
export async function generateStaticParams() {
  // For static generation, return empty array to generate pages on demand
  // Or load from JSON as fallback
  try {
    // Import project data for static generation
    const projectsData = require("@/lib/projects-data.json");
    return projectsData.projects.map((project: any) => ({
      slug: project.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for each project
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  
  if (!project) {
    return {
      title: "Projet non trouvé - Formdetoit"
    };
  }

  return {
    title: `${project.title} - Formdetoit | Réalisation ${project.location}`,
    description: project.description.substring(0, 160),
    openGraph: {
      title: `${project.title} | Réalisation FormDeToit`,
      description: project.description.substring(0, 160),
      images: project.mainImage ? [{
        url: project.mainImage,
        width: 1200,
        height: 630,
        alt: project.title,
      }] : [],
      type: 'article',
      locale: 'fr_FR',
      siteName: 'FormDeToit',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | Réalisation FormDeToit`,
      description: project.description.substring(0, 160),
      images: project.mainImage ? [project.mainImage] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  
  if (!project) {
    notFound();
  }

  // Get related projects
  const categoryIds = project.project_categories?.map(pc => pc.category_id) || [];
  const relatedProjects = await getRelatedProjects(project.id, categoryIds);

  return (
    <>
      {/* Hero Section */}
      <PageHero
        title={project.title}
        subtitle={project.subtitle || `Réalisation à ${project.location}`}
        backgroundImage={project.mainImage || undefined}
      />

      {/* Breadcrumb */}
      <section className="bg-slate-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/nos-realisations" className="hover:text-yellow">Nos réalisations</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-yellow">{project.title}</span>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {project.projectCategories?.map((category) => category && (
                      <span 
                        key={category.id}
                        className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: '#6B7280' }} // Default color, will be handled by CSS later
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-yellow" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-yellow" />
                      <span>{project.date}</span>
                    </div>
                    {project.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow" />
                        <span>{project.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {project.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <AnimatedSection>
                  {(project as any).gallery_layout === 'before-after' ? (
                    <BeforeAfterGallery images={project.gallery} title={project.title} />
                  ) : (
                    <ProjectGallery images={project.gallery} title={project.title} />
                  )}
                </AnimatedSection>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              
              {/* Technical Details */}
              {project.technical_details && project.technical_details.length > 0 && (
                <AnimatedSection>
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-yellow" />
                      Détails techniques
                    </h3>
                    <ul className="space-y-2">
                      {project.technical_details.map((detail, index) => (
                        <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="w-2 h-2 bg-yellow rounded-full mt-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </AnimatedSection>
              )}

              {/* Materials */}
              {project.materials && project.materials.length > 0 && (
                <AnimatedSection>
                  <GlassCard className="p-6">
                    <h3 className="text-xl font-bold mb-4">Matériaux utilisés</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.materials.map((material, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-slate-100 text-gray-700 rounded-full text-sm"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </AnimatedSection>
              )}

              {/* CTA */}
              <AnimatedSection>
                <GlassCard className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-4">Un projet similaire ?</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Confiez-nous votre projet de toiture. Devis gratuit sous 24h.
                  </p>
                  <CTAButton size="lg" glow href="/contact" className="w-full">
                    <Phone className="w-5 h-5" />
                    Demander un devis
                  </CTAButton>
                </GlassCard>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <AnimatedSection>
          <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Projets similaires</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Découvrez d'autres réalisations dans la même catégorie
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProjects.map((relatedProject, index) => (
                  <AnimatedSection key={relatedProject.id} delay={0.1 * index}>
                    <Link href={`/nos-realisations/${relatedProject.slug}`}>
                      <GlassCard hover className="group overflow-hidden h-full">
                        <div className="relative h-64 overflow-hidden">
                          <Image
                            src={(relatedProject as any).mainImage || '/placeholder.jpg'}
                            alt={relatedProject.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          <div className="absolute bottom-4 left-4 right-4 text-white">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{relatedProject.location}</span>
                              </div>
                              <span>{relatedProject.date}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-sm mb-2 group-hover:text-yellow transition-colors line-clamp-2">
                            {relatedProject.title}
                          </h3>
                        </div>
                      </GlassCard>
                    </Link>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Navigation */}
      <section className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/nos-realisations"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux réalisations
            </Link>
            
            <CTAButton variant="outline" href="/contact">
              Nous contacter
            </CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}