const supabase = require('./backend/supabaseClient.cjs');

async function test() {
  const settings = { themePrimaryColor: '#00FF00', footerDescription: 'Test Footer' };
  
  console.log("Upserting settings...");
  const { data, error } = await supabase.from('company_settings')
      .upsert({
        id: 'main',
        data: settings,
        updated_at: new Date().toISOString()
      });
      
  if (error) {
    console.error("UPSERT ERROR:", error.message);
  } else {
    console.log("UPSERT SUCCESS!");
  }
}

test();
