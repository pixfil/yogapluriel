// Script to add main images to projects from JSON data
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ProjectData {
  slug: string;
  mainImage?: string;
  gallery?: Array<{ url: string }>;
}

async function addProjectImages() {
  try {
    // Read the JSON data
    const jsonPath = path.join(__dirname, '..', 'lib', 'projects-data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`📚 Loaded ${jsonData.projects.length} projects from JSON`);

    // Get all existing projects from Supabase
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, slug');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return;
    }

    console.log(`🔍 Found ${projects?.length} projects in database`);

    // Create a map of slug to project ID
    const projectMap = new Map(projects?.map(p => [p.slug, p.id]) || []);

    let addedImages = 0;
    let errors = 0;

    for (const jsonProject of jsonData.projects as ProjectData[]) {
      const projectId = projectMap.get(jsonProject.slug);
      
      if (!projectId) {
        console.log(`⚠️  Project not found in database: ${jsonProject.slug}`);
        continue;
      }

      console.log(`\n📷 Processing images for: ${jsonProject.slug}`);

      // Add main image if it exists
      if (jsonProject.mainImage) {
        try {
          // Update the main_image field in the projects table instead
          const { error: mainImageError } = await supabase
            .from('projects')
            .update({
              main_image: jsonProject.mainImage
            })
            .eq('id', projectId);

          if (mainImageError) {
            console.error(`❌ Error updating main image for ${jsonProject.slug}:`, mainImageError);
            errors++;
          } else {
            console.log(`✅ Updated main image: ${path.basename(jsonProject.mainImage)}`);
            addedImages++;
          }
        } catch (error) {
          console.error(`❌ Exception updating main image for ${jsonProject.slug}:`, error);
          errors++;
        }
      }

      // Add gallery images if they exist
      if (jsonProject.gallery && jsonProject.gallery.length > 0) {
        for (let i = 0; i < jsonProject.gallery.length; i++) {
          const galleryImage = jsonProject.gallery[i];
          
          try {
            const { error: galleryImageError } = await supabase
              .from('project_images')
              .insert({
                project_id: projectId,
                url: galleryImage.url,
                alt: jsonProject.slug, // Using slug as alt text
                type: 'detail',
                order_index: i + 1
              });

            if (galleryImageError) {
              console.error(`❌ Error adding gallery image ${i + 1} for ${jsonProject.slug}:`, galleryImageError);
              errors++;
            } else {
              console.log(`✅ Added gallery image ${i + 1}: ${path.basename(galleryImage.url)}`);
              addedImages++;
            }
          } catch (error) {
            console.error(`❌ Exception adding gallery image ${i + 1} for ${jsonProject.slug}:`, error);
            errors++;
          }
        }
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Images added: ${addedImages}`);
    console.log(`   - Errors: ${errors}`);

    if (errors === 0) {
      console.log(`✅ All images migrated successfully!`);
    } else {
      console.log(`⚠️  Some images could not be migrated`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the migration
addProjectImages();