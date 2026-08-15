
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUploadsBucket() {
  console.log('Creating/updating "uploads" bucket in Supabase Storage...');
  
  const bucketConfig = {
    public: true,
    fileSizeLimit: 125829120, // 120MB (120 * 1024 * 1024 bytes)
    allowedMimeTypes: [
      'image/*',
      'video/*',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  };

  const { data, error } = await supabase.storage.createBucket('uploads', bucketConfig);

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('exceeded the maximum allowed size')) {
      console.log('✅ Bucket "uploads" already exists or needs update. Updating bucket settings...');
      let { error: updateError } = await supabase.storage.updateBucket('uploads', bucketConfig);
      if (updateError) {
        // Fallback for projects where fileSizeLimit cannot exceed project plan default
        const { error: mimeOnlyError } = await supabase.storage.updateBucket('uploads', {
          public: true,
          allowedMimeTypes: bucketConfig.allowedMimeTypes
        });
        if (mimeOnlyError) {
          console.error('❌ Error updating bucket configuration:', mimeOnlyError.message);
        } else {
          console.log('✅ Bucket "uploads" updated successfully with allowed video mime types!');
        }
      } else {
        console.log('✅ Bucket "uploads" updated successfully with video mime types and 120MB limit!');
      }
    } else {
      console.error('❌ Error creating bucket:', error.message);
    }
  } else {
    console.log('✅ Bucket "uploads" created successfully with video mime types and 120MB limit!');
  }
}

createUploadsBucket();
