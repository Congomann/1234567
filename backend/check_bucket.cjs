const supabase = require('./supabaseClient.cjs');

async function checkConfig() {
  const { data, error } = await supabase.storage.getBucket('uploads');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Bucket config:', data);
  }
}

checkConfig();
