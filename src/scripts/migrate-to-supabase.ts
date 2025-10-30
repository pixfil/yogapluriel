#!/usr/bin/env tsx

/**
 * Migration script: JSON to Supabase
 * 
 * This script migrates data from projects-data.json to Supabase
 * Run with: npx tsx src/scripts/migrate-to-supabase.ts
 * 
 * Prerequisites:
 * 1. Supabase tables must be created (run supabase-schema.sql)
 * 2. Environment variables must be set in .env.local
 * 3. Storage bucket 'project-images' must exist
 */

import { createClient } from '@supabase/supabase-js';
import projectsData from '../lib/projects-data.json';
import { Database } from '../lib/supabase';

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create admin client
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateCategoriesData() {
  console.log('📝 Migrating categories...');
  
  // Categories should already exist from schema, but let's update them
  for (const category of projectsData.categories) {
    const { error } = await supabase
      .from('categories')
      .upsert({
        // Don't specify ID, let Supabase generate UUID
        name: category.name,
        slug: category.slug,
        color: category.color
      });
    
    if (error) {
      console.error(`❌ Error upserting category ${category.name}:`, error);
    } else {
      console.log(`✅ Category "${category.name}" migrated`);
    }
  }
}

async function migrateProjectsData() {
  console.log('📝 Migrating projects...');
  
  // First, get all categories to map slugs to UUIDs
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug');
  
  const categoryMap = new Map(categories?.map(cat => [cat.slug, cat.id]) || []);
  
  for (const project of projectsData.projects) {
    // Insert project (let Supabase generate UUID)
    const { data: insertedProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        slug: project.slug,
        title: project.title,
        subtitle: project.subtitle,
        location: project.location,
        date: project.date,
        main_image: project.mainImage,
        description: project.description,
        technical_details: project.technicalDetails,
        materials: project.materials,
        duration: project.duration,
        featured: project.featured,
        published: project.published
      })
      .select()
      .single();

    if (projectError) {
      console.error(`❌ Error inserting project ${project.title}:`, projectError);
      continue;
    }

    console.log(`✅ Project "${project.title}" migrated`);

    // Insert project categories relationships using real UUIDs
    for (const categorySlug of project.category) {
      const categoryUUID = categoryMap.get(categorySlug);
      if (!categoryUUID) {
        console.error(`❌ Category not found for slug: ${categorySlug}`);
        continue;
      }
      
      const { error: categoryError } = await supabase
        .from('project_categories')
        .insert({
          project_id: insertedProject.id,
          category_id: categoryUUID
        });

      if (categoryError) {
        console.error(`❌ Error linking category ${categorySlug} to project ${project.title}:`, categoryError);
      }
    }

    // Insert project images (let Supabase generate UUIDs)
    for (const image of project.gallery) {
      const { error: imageError } = await supabase
        .from('project_images')
        .insert({
          project_id: insertedProject.id,
          url: image.url,
          alt: image.alt,
          caption: image.caption,
          type: image.type,
          order_index: image.order
        });

      if (imageError) {
        console.error(`❌ Error inserting image for project ${project.title}:`, imageError);
      }
    }

    console.log(`📷 ${project.gallery.length} images migrated for "${project.title}"`);
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  // Count records
  const { count: categoriesCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });
  
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });
  
  const { count: imagesCount } = await supabase
    .from('project_images')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Migration Summary:`);
  console.log(`   Categories: ${categoriesCount}`);
  console.log(`   Projects: ${projectsCount}`);
  console.log(`   Images: ${imagesCount}`);
  
  // Test a query with joins
  const { data: projectWithCategories, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_categories (
        categories (*)
      ),
      project_images (*)
    `)
    .eq('published', true)
    .limit(1)
    .single();
  
  if (error) {
    console.error('❌ Error testing join query:', error);
  } else {
    console.log('✅ Join query test successful');
    console.log('📄 Sample project:', projectWithCategories?.title);
  }
}

async function main() {
  console.log('🚀 Starting migration from JSON to Supabase...\n');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    if (error) {
      console.error('❌ Cannot connect to Supabase:', error);
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful\n');
    
    // Run migrations
    await migrateCategoriesData();
    console.log('');
    await migrateProjectsData();
    console.log('');
    await verifyMigration();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Create storage bucket "project-images" in Supabase Dashboard');
    console.log('2. Execute supabase-storage.sql for storage policies');
    console.log('3. Upload actual project images to storage bucket');
    console.log('4. Update image URLs in database to point to Supabase storage');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is called directly
if (require.main === module) {
  main();
}