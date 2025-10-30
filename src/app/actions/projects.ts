'use server';

// @ts-nocheck
import { createClient, getAdminClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { projectSchema, ProjectFormData } from '@/lib/validations/project';
import { redirect } from 'next/navigation';

interface ImageData {
  id: string;
  file?: File;
  url: string;
  description: string;
  isMain: boolean;
  order: number;
  imageType?: 'avant' | 'pendant' | 'apres' | 'detail' | 'gallery';
}

export async function createProject(formData: ProjectFormData, images: ImageData[]) {
  const supabase = await createClient();

  try {
    // Validate form data
    const validatedData = projectSchema.parse(formData);

    // Find main image URL if any
    let mainImageUrl = null;
    if (images.length > 0) {
      const mainImage = images.find(img => img.isMain);
      mainImageUrl = mainImage?.url || images[0].url;
    }

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: validatedData.title,
        slug: validatedData.slug,
        subtitle: validatedData.subtitle || null,
        location: validatedData.location,
        date: validatedData.date,
        description: validatedData.description,
        technical_details: validatedData.technical_details || [],
        materials: validatedData.materials || [],
        duration: validatedData.duration || null,
        published: validatedData.published,
        featured: validatedData.featured,
        gallery_layout: validatedData.gallery_layout || 'grid',
        main_image: mainImageUrl,
      } as any)
      .select('id')
      .single();

    if (projectError) {
      throw new Error(`Erreur lors de la création du projet: ${projectError.message}`);
    }

    const projectId = (project as any)?.id;

    // Upload images and create image records
    if (images.length > 0) {
      let finalMainImageUrl = mainImageUrl;

      // Use admin client to bypass RLS for image insertions
      const adminSupabase = getAdminClient();

      for (const image of images) {
        let imageUrl = image.url;

        // If it's a file (new upload), upload to Supabase Storage
        if (image.file && image.url.startsWith('blob:')) {
          imageUrl = await uploadImageToStorage(image.file, projectId);

          // Update main image URL if this was the main image
          if (image.isMain || (finalMainImageUrl === image.url)) {
            finalMainImageUrl = imageUrl;
          }
        }

        // Insert image record using admin client to bypass RLS
        const imageData = {
          project_id: projectId,
          url: imageUrl,
          alt: image.description || null,
          type: image.imageType || 'gallery',
          order_index: image.order,
        };

        console.log('[Project] Inserting image:', imageData);

        const { error: imageError } = await adminSupabase
          .from('project_images')
          .insert(imageData as any);

        if (imageError) {
          console.error('[Project] Error inserting image:', imageError);
        } else {
          console.log('[Project] Image inserted successfully');
        }
      }

      // Update main_image with final URL if it changed
      if (finalMainImageUrl !== mainImageUrl) {
        await supabase
          .from('projects')
          .update({ main_image: finalMainImageUrl })
          .eq('id', projectId);
      }
    }

    // Associate with categories
    if (validatedData.categories.length > 0) {
      const categoryInserts = validatedData.categories.map(categoryId => ({
        project_id: projectId,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from('project_categories')
        .insert(categoryInserts as any);

      if (categoryError) {
        console.error('Error associating categories:', categoryError);
      }
    }

    revalidatePath('/admin/projects');
    return { success: true, id: projectId };
    
  } catch (error) {
    console.error('Error creating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

export async function updateProject(
  projectId: string,
  formData: ProjectFormData,
  images: ImageData[]
) {
  const supabase = await createClient();

  try {
    // Validate form data
    const validatedData = projectSchema.parse(formData);

    // Find main image URL if any
    let mainImageUrl = null;
    if (images.length > 0) {
      const mainImage = images.find(img => img.isMain);
      mainImageUrl = mainImage?.url || images[0].url;
    }

    // Delete existing images
    await supabase
      .from('project_images')
      .delete()
      .eq('project_id', projectId);

    // Upload new images
    if (images.length > 0) {
      let finalMainImageUrl = mainImageUrl;

      // Use admin client to bypass RLS for image insertions
      const adminSupabase = getAdminClient();

      for (const image of images) {
        let imageUrl = image.url;

        // If it's a new file, upload to Supabase Storage
        if (image.file && image.url.startsWith('blob:')) {
          imageUrl = await uploadImageToStorage(image.file, projectId);

          // Update main image URL if this was the main image
          if (image.isMain || (finalMainImageUrl === image.url)) {
            finalMainImageUrl = imageUrl;
          }
        }

        // Insert image record using admin client to bypass RLS
        const imageData = {
          project_id: projectId,
          url: imageUrl,
          alt: image.description || null,
          type: image.imageType || 'gallery',
          order_index: image.order,
        };

        console.log('[Project] Inserting image:', imageData);

        const { error: imageError } = await adminSupabase
          .from('project_images')
          .insert(imageData as any);

        if (imageError) {
          console.error('[Project] Error inserting image:', imageError);
        } else {
          console.log('[Project] Image inserted successfully');
        }
      }

      // Use final URL if it changed after upload
      if (finalMainImageUrl !== mainImageUrl) {
        mainImageUrl = finalMainImageUrl;
      }
    }

    // Update the project with all data including main_image
    const { error: projectError } = await supabase
      .from('projects')
      .update({
        title: validatedData.title,
        slug: validatedData.slug,
        subtitle: validatedData.subtitle || null,
        location: validatedData.location,
        date: validatedData.date,
        description: validatedData.description,
        technical_details: validatedData.technical_details || [],
        materials: validatedData.materials || [],
        duration: validatedData.duration || null,
        published: validatedData.published,
        featured: validatedData.featured,
        gallery_layout: validatedData.gallery_layout || 'grid',
        main_image: mainImageUrl,
      } as any)
      .eq('id', projectId);

    if (projectError) {
      throw new Error(`Erreur lors de la mise à jour du projet: ${projectError.message}`);
    }

    // Update categories
    await supabase
      .from('project_categories')
      .delete()
      .eq('project_id', projectId);

    if (validatedData.categories.length > 0) {
      const categoryInserts = validatedData.categories.map(categoryId => ({
        project_id: projectId,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from('project_categories')
        .insert(categoryInserts as any);

      if (categoryError) {
        console.error('Error associating categories:', categoryError);
      }
    }

    revalidatePath('/admin/projects');
    return { success: true };
    
  } catch (error) {
    console.error('Error updating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  try {
    // Get current user for deleted_by field
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Non authentifié');
    }

    // Soft delete the project (set deleted_at and deleted_by)
    const { error } = await supabase
      .from('projects')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
      })
      .eq('id', projectId);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }

    revalidatePath('/admin/projects');
    return { success: true };

  } catch (error) {
    console.error('Error deleting project:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

export async function getCategories() {
  const supabase = await createClient();
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');

    if (error) {
      throw new Error(`Erreur lors du chargement des catégories: ${error.message}`);
    }

    return { success: true, data: categories || [] };
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { 
      success: false, 
      data: [],
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

export async function getProject(projectId: string) {
  const supabase = await createClient();
  
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_images(id, url, alt, type, order_index),
        project_categories(category_id)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      throw new Error(`Erreur lors du chargement du projet: ${error.message}`);
    }

    return { success: true, data: project };
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return { 
      success: false, 
      data: null,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

async function uploadImageToStorage(file: File, projectId: string): Promise<string> {
  const supabase = await createClient();
  
  // Generate unique filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${projectId}/${Date.now()}-${Math.random()}.${fileExtension}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', {
        message: error.message,
        statusCode: error.statusCode,
        fileName,
      });
      throw new Error(`Échec de l'upload vers Supabase Storage: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Impossible de récupérer l\'URL publique de l\'image');
    }

    console.log('Image uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('Error uploading image to Supabase Storage:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName,
      projectId,
    });
    // Throw error instead of returning blob URL
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

export async function toggleProjectStatus(projectId: string, field: 'published' | 'featured') {
  const supabase = await createClient();
  
  try {
    // Get current status
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select(field)
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      throw new Error('Projet non trouvé');
    }

    // Toggle the status
    const newStatus = !project[field];
    
    const { error: updateError } = await supabase
      .from('projects')
      .update({ [field]: newStatus })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }

    revalidatePath('/admin/projects');
    return { success: true, newStatus };

  } catch (error) {
    console.error('Error toggling project status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}

export async function toggleProjectHighlight(projectId: string, currentValue: boolean) {
  const supabase = await createClient();

  try {
    const newValue = !currentValue;

    // If activating highlight, first deactivate all other highlighted projects
    if (newValue === true) {
      const { error: deactivateError } = await supabase
        .from('projects')
        .update({ is_highlighted: false })
        .neq('id', projectId)
        .eq('is_highlighted', true);

      if (deactivateError) {
        throw new Error(`Erreur lors de la désactivation des autres projets: ${deactivateError.message}`);
      }
    }

    // Now toggle the target project
    const { error: updateError } = await supabase
      .from('projects')
      .update({ is_highlighted: newValue })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }

    revalidatePath('/admin/projects');
    revalidatePath('/');
    return { success: true, newValue };

  } catch (error) {
    console.error('Error toggling project highlight:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    };
  }
}