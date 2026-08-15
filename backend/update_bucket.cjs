const supabase = require('./supabaseClient.cjs');

async function updateLimit() {
  const { data, error } = await supabase.storage.updateBucket('uploads', {
    fileSizeLimit: 150 * 1024 * 1024, // 150MB
    allowedMimeTypes: null // allow all
  });
  
  if (error) {
    console.error('Error updating bucket:', error);
  } else {
    console.log('Bucket updated successfully:', data);
  }
}

updateLimit();
