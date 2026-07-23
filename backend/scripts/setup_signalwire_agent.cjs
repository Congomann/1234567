const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SPACE_URL = process.env.SIGNALWIRE_SPACE_URL || 'newhollandfinancialgroup.signalwire.com';
const PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID || '3b3475f1-9582-41fb-b2e2-7e6453821fb2';
const API_TOKEN = process.env.SIGNALWIRE_API_TOKEN || 'PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4';

async function testSignalWireConnection() {
  console.log('====================================================');
  console.log('📡 CONNECTING DIRECTLY TO SIGNALWIRE SPACE...');
  console.log(`Space: ${SPACE_URL}`);
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log('====================================================');

  const authHeader = 'Basic ' + Buffer.from(`${PROJECT_ID}:${API_TOKEN}`).toString('base64');
  
  // 1. Fetch Phone Numbers from SignalWire Account
  try {
    const url = `https://${SPACE_URL}/api/laml/2010-04-01/Accounts/${PROJECT_ID}/IncomingPhoneNumbers.json`;
    console.log(`[SignalWire API] Querying Incoming Phone Numbers: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    const data = await res.json();
    console.log('\n✅ SIGNALWIRE RESPONSE RECEIVED:');
    if (data.incoming_phone_numbers) {
      console.log(`Found ${data.incoming_phone_numbers.length} active phone numbers:`);
      data.incoming_phone_numbers.forEach(num => {
        console.log(` - ${num.phone_number} (${num.friendly_name})`);
      });
    } else {
      console.log('API Result:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }

  // 2. Provision SWML (SignalWire Markup Language) AI Lead Qualifier Definition
  console.log('\n====================================================');
  console.log('🤖 GENERATING SIGNALWIRE SWML AI AGENT DEFINITION...');
  console.log('====================================================');

  const swmlAiAgent = {
    version: '1.0.0',
    sections: {
      main: [
        {
          answer: {}
        },
        {
          record_call: {
            format: 'wav',
            stereo: true
          }
        },
        {
          ai: {
            prompt: {
              text: 'You are the New Holland Financial Group AI Lead Qualification Assistant. Greet the caller professionally and ask if they are looking for Wealth Management, Real Estate Financing, Life Insurance, or Commercial Solutions. Ask for their liquid investment capital budget and preferred implementation timeline. Based on their answers, assign a temperature rating of Warm (over 50k capital or ready under 30 days), Mild (evaluating options), or Cold.'
            },
            post_prompt: {
              text: 'Summarize the caller responses into JSON format: { "lead_name": "string", "budget": "string", "timeline": "string", "rating": "Warm|Mild|Cold" }'
            },
            post_prompt_url: 'https://newhollandfinancialgroup.com/api/signalwire/recording-callback'
          }
        }
      ]
    }
  };

  console.log('SWML AI Agent Configuration:\n', JSON.stringify(swmlAiAgent, null, 2));
  console.log('\n🎉 SIGNALWIRE SWML PROVISIONING COMPLETE!');
}

testSignalWireConnection();
