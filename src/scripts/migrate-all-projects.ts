import { createClient } from '@supabase/supabase-js';
import projectsData from '../lib/projects-data.json';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateCategories() {
  console.log('🏷️  Migrating categories...');
  
  const categoryMap = new Map<string, string>(); // slug -> uuid mapping
  
  for (const category of projectsData.categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        name: category.name,
        slug: category.slug,
        description: `Catégorie ${category.name} - Travaux de ${category.slug}`
      }, { onConflict: 'name' })
      .select('id, name')
      .single();

    if (error) {
      console.error(`❌ Error migrating category ${category.name}:`, error);
    } else {
      console.log(`✅ Category migrated: ${category.name} (ID: ${data.id})`);
      categoryMap.set(category.slug, data.id);
    }
  }
  
  return categoryMap;
}

async function migrateProjects(categoryMap: Map<string, string>) {
  console.log('🏗️  Migrating projects...');
  
  for (const project of projectsData.projects) {
    try {
      // Insert project (let Supabase generate UUID)
      const { data: insertedProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: project.title,
          slug: project.slug, // Use the slug from JSON
          subtitle: project.subtitle || null,
          location: project.location,
          date: project.date,
          description: project.description || '',
          technical_details: project.technicalDetails || [],
          materials: project.materials || [],
          duration: project.duration || null,
          published: project.published || false,
          featured: project.featured || false
        })
        .select('id')
        .single();

      if (projectError) {
        console.error(`❌ Error migrating project ${project.title}:`, projectError);
        continue;
      }

      const projectId = insertedProject.id;
      console.log(`✅ Project migrated: ${project.title} (ID: ${projectId})`);

      // Migrate main image
      if (project.mainImage) {
        const { error: mainImageError } = await supabase
          .from('project_images')
          .insert({
            project_id: projectId,
            url: project.mainImage,
            description: `Image principale de ${project.title}`,
            is_main: true,
            display_order: 1
          });

        if (mainImageError) {
          console.error(`❌ Error migrating main image for ${project.title}:`, mainImageError);
        }
      }

      // Migrate gallery images
      if (project.gallery && project.gallery.length > 0) {
        for (const [index, image] of project.gallery.entries()) {
          const { error: imageError } = await supabase
            .from('project_images')
            .insert({
              project_id: projectId,
              url: image.url,
              description: image.alt,
              is_main: false,
              display_order: index + 2 // Start at 2 since main image is 1
            });

          if (imageError) {
            console.error(`❌ Error migrating gallery image ${index} for ${project.title}:`, imageError);
          }
        }
      }

      // Associate with categories
      if (project.category && project.category.length > 0) {
        for (const categorySlug of project.category) {
          const categoryId = categoryMap.get(categorySlug);
          
          if (categoryId) {
            const { error: categoryError } = await supabase
              .from('project_categories')
              .insert({
                project_id: projectId,
                category_id: categoryId
              });

            if (categoryError) {
              console.error(`❌ Error associating category ${categorySlug} to ${project.title}:`, categoryError);
            } else {
              console.log(`  ✅ Category ${categorySlug} associated`);
            }
          } else {
            console.warn(`⚠️  Category ${categorySlug} not found in map`);
          }
        }
      }

    } catch (error) {
      console.error(`❌ Unexpected error migrating project ${project.title}:`, error);
    }
  }
}

async function cleanupExisting() {
  console.log('🧹 Cleaning up existing data...');
  
  // Delete in correct order to respect foreign key constraints
  await supabase.from('project_categories').delete().gte('id', 0);
  await supabase.from('project_images').delete().gte('id', 0);
  await supabase.from('projects').delete().gte('created_at', '1900-01-01');
  await supabase.from('categories').delete().gte('created_at', '1900-01-01');
  
  console.log('✅ Cleanup completed');
}

async function main() {
  try {
    console.log('🚀 Starting complete migration...');
    console.log(`📊 Found ${projectsData.categories.length} categories and ${projectsData.projects.length} projects`);
    
    // Clean up existing data
    await cleanupExisting();
    
    // Migrate categories first
    const categoryMap = await migrateCategories();
    
    // Then migrate projects
    await migrateProjects(categoryMap);
    
    console.log('🎉 Migration completed successfully!');
    
    // Show summary
    const { count: categoriesCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
      
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
      
    const { count: imagesCount } = await supabase
      .from('project_images')
      .select('*', { count: 'exact', head: true });

    console.log(`📈 Final counts:`);
    console.log(`  - Categories: ${categoriesCount}`);
    console.log(`  - Projects: ${projectsCount}`);
    console.log(`  - Images: ${imagesCount}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default main;