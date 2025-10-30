import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createPopupImagesBucket() {
  console.log('🗂️  Creating popup-images bucket...\n');

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'popup-images');

    if (bucketExists) {
      console.log('✅ Bucket "popup-images" already exists');
    } else {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('popup-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }

      console.log('✅ Bucket "popup-images" created successfully');
    }

    // Verify bucket permissions
    const { data: publicUrlData } = supabase.storage
      .from('popup-images')
      .getPublicUrl('test.jpg');

    console.log('\n📋 Bucket info:');
    console.log(`   - Name: popup-images`);
    console.log(`   - Public: Yes`);
    console.log(`   - Max file size: 10MB`);
    console.log(`   - Allowed types: JPEG, PNG, WebP, GIF`);
    console.log(`   - Public URL pattern: ${publicUrlData.publicUrl.split('/test.jpg')[0]}/`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createPopupImagesBucket();
