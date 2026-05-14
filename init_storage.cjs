
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
  console.log('Creating "uploads" bucket in Supabase Storage...');
  
  const { data, error } = await supabase.storage.createBucket('uploads', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['image/*', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Bucket "uploads" already exists.');
    } else {
      console.error('❌ Error creating bucket:', error.message);
    }
  } else {
    console.log('✅ Bucket "uploads" created successfully!');
  }
}

createUploadsBucket();
