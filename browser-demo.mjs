
import { Browserbase } from '@browserbasehq/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env from root
dotenv.config();

const browserbase = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

async function main() {
  console.log('🚀 Initializing Browserbase Session...');
  
  try {
    const session = await browserbase.sessions.create({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
    });

    console.log('✅ Session Created Successfully!');
    console.log('-----------------------------------');
    console.log(`🆔 ID:      ${session.id}`);
    console.log(`🔗 URL:     ${session.connectUrl}`);
    console.log(`📡 Status:  ${session.status}`);
    console.log('-----------------------------------');
    console.log('You can view this session in your dashboard: https://www.browserbase.com/dashboard');
  } catch (error) {
    console.error('❌ Failed to create session:', error.message);
  }
}

main();
