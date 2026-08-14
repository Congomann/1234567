/**
 * AUTOMATED AD CAMPAIGN LEAD SIMULATOR (R4.2)
 * Streams mock lead payloads from Meta, Google, and TV ads at fixed intervals (8s default)
 * to POST /api/webhooks/campaigns.
 * 
 * Supports CLI standalone execution (--once flag or interval daemon)
 * and programmatic module exports (startSimulator / stopSimulator).
 */

const FIRST_NAMES = [
  'Alexander', 'Beatrice', 'Charles', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah',
  'Ian', 'Julia', 'Kevin', 'Laura', 'Marcus', 'Nora', 'Oliver', 'Penelope', 'Quentin',
  'Rachel', 'Samuel', 'Theresa', 'Ulysses', 'Victoria', 'William', 'Xena', 'Yusuf', 'Zoe',
  'Arthur', 'Chloe', 'Dominic', 'Eleanor', 'Felix', 'Grace', 'Henry', 'Isabel', 'Julian'
];

const LAST_NAMES = [
  'Anderson', 'Brooks', 'Campbell', 'Danforth', 'Evans', 'Fletcher', 'Grayson', 'Hayes',
  'Ingram', 'Jackson', 'Kensington', 'Lancaster', 'Montgomery', 'Nelson', 'Oakley', 'Preston',
  'Quinn', 'Reynolds', 'Sterling', 'Taylor', 'Underwood', 'Vance', 'Waverly', 'York',
  'Bennett', 'Carter', 'Drake', 'Forbes', 'Galloway', 'Hamilton', 'Kingsley', 'Sinclair'
];

const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'apexcapital.com', 'vanguardcorp.org', 'premierwealth.net'
];

const CHANNEL_CONFIGS = {
  meta: {
    campaigns: ['cmp_meta_wealth_2026', 'cmp_meta_retire_plus', 'cmp_meta_equity_boost'],
    incomeRange: [65000, 220000],
    assetRange: [150000, 1200000],
    creditRange: [640, 790]
  },
  google: {
    campaigns: ['cmp_goog_wealth_mgmt', 'cmp_goog_jumbo_leads', 'cmp_goog_tax_strategy'],
    incomeRange: [110000, 380000],
    assetRange: [400000, 3500000],
    creditRange: [680, 820]
  },
  tv: {
    campaigns: ['cmp_tv_prime_news', 'cmp_tv_retire_safe', 'cmp_tv_legacy_fund'],
    incomeRange: [85000, 290000],
    assetRange: [300000, 2800000],
    creditRange: [660, 810]
  }
};

const CHANNELS = ['meta', 'google', 'tv'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a realistic mock lead payload matching the interface contract
 */
function generateMockLead(channelInput) {
  const channel = (channelInput && CHANNELS.includes(channelInput))
    ? channelInput
    : getRandomElement(CHANNELS);
  const config = CHANNEL_CONFIGS[channel];

  const firstName = getRandomElement(FIRST_NAMES);
  const lastName = getRandomElement(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(10, 99)}@${getRandomElement(EMAIL_DOMAINS)}`;
  const phone = `+1555${getRandomInt(100, 999)}${getRandomInt(1000, 9999)}`;
  const campaignId = getRandomElement(config.campaigns);

  const annualIncome = Math.round(getRandomInt(config.incomeRange[0], config.incomeRange[1]) / 1000) * 1000;
  const assetVolume = Math.round(getRandomInt(config.assetRange[0], config.assetRange[1]) / 5000) * 5000;
  const creditScore = getRandomInt(config.creditRange[0], config.creditRange[1]);

  return {
    channel,
    campaign_id: campaignId,
    lead: {
      full_name: fullName,
      email,
      phone,
      annual_income: annualIncome,
      asset_volume: assetVolume,
      credit_score: creditScore
    }
  };
}

let simulatorIntervalHandle = null;
let currentChannelIndex = 0;
let stats = { totalSent: 0, totalSuccess: 0, totalFailed: 0 };

/**
 * Sends a single lead payload to the webhook target URL using HTTP POST fetch
 */
async function sendLeadPayload(payload, targetUrl) {
  const url = targetUrl || process.env.SIMULATOR_TARGET_URL || 'http://localhost:3001/api/webhooks/campaigns';
  const timestamp = new Date().toISOString();

  try {
    stats.totalSent++;
    console.log(`[${timestamp}] [AdSimulator] 🚀 Sending ${payload.channel.toUpperCase()} lead payload (${payload.campaign_id}) to ${url}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    stats.totalSuccess++;
    console.log(`[${timestamp}] [AdSimulator] ✅ Webhook accepted! Lead ID: ${data.lead_id} | Status: ${data.status} | Lead: ${payload.lead.full_name} ($${payload.lead.asset_volume.toLocaleString()} assets, $${payload.lead.annual_income.toLocaleString()} inc, ${payload.lead.credit_score} cs)`);
    return { success: true, data };
  } catch (err) {
    stats.totalFailed++;
    console.warn(`[${timestamp}] [AdSimulator] ⚠️ Delivery failed (${err.message}). Server might be starting or busy. Retrying next cycle.`);
    return { success: false, error: err.message };
  }
}

/**
 * Starts the automated simulator loop
 */
function startSimulator(options = {}) {
  if (simulatorIntervalHandle) {
    console.log('[AdSimulator] Simulator loop is already running.');
    return;
  }

  const port = options.port || process.env.PORT || 3001;
  const targetUrl = options.targetUrl || `http://localhost:${port}/api/webhooks/campaigns`;
  const intervalMs = options.intervalMs || parseInt(process.env.SIMULATOR_INTERVAL_MS || '8000', 10);

  console.log(`[AdSimulator] 🟢 Starting background lead simulator loop (Target: ${targetUrl}, Interval: ${intervalMs}ms)`);

  // Initial ping delay
  const initialDelay = options.initialDelayMs !== undefined ? options.initialDelayMs : 2000;
  setTimeout(async () => {
    if (!simulatorIntervalHandle) return; // check if stopped during initial delay
    const payload = generateMockLead(CHANNELS[currentChannelIndex]);
    currentChannelIndex = (currentChannelIndex + 1) % CHANNELS.length;
    await sendLeadPayload(payload, targetUrl);
  }, initialDelay);

  simulatorIntervalHandle = setInterval(async () => {
    const payload = generateMockLead(CHANNELS[currentChannelIndex]);
    currentChannelIndex = (currentChannelIndex + 1) % CHANNELS.length;
    await sendLeadPayload(payload, targetUrl);
  }, intervalMs);
}

/**
 * Stops the automated simulator loop
 */
function stopSimulator() {
  if (simulatorIntervalHandle) {
    clearInterval(simulatorIntervalHandle);
    simulatorIntervalHandle = null;
    console.log('[AdSimulator] 🔴 Simulator background loop stopped.');
  }
}

function getStats() {
  return { ...stats, isRunning: simulatorIntervalHandle !== null };
}

function resetStats() {
  stats = { totalSent: 0, totalSuccess: 0, totalFailed: 0 };
  currentChannelIndex = 0;
}

function parseCLIArgs(args) {
  let onceFlag = false;
  let customTarget = undefined;
  let customInterval = undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--once') {
      onceFlag = true;
    } else if (arg.startsWith('--target=')) {
      customTarget = arg.slice('--target='.length);
    } else if (arg === '--target' && i + 1 < args.length) {
      customTarget = args[++i];
    } else if (arg.startsWith('--interval=')) {
      customInterval = arg.slice('--interval='.length);
    } else if (arg === '--interval' && i + 1 < args.length) {
      customInterval = args[++i];
    }
  }

  return { onceFlag, customTarget, customInterval };
}

// --- CLI ENTRY POINT GUARD ---
if (require.main === module) {
  const args = process.argv.slice(2);
  const { onceFlag, customTarget, customInterval } = parseCLIArgs(args);

  if (onceFlag) {
    console.log('[AdSimulator] Running single simulation test...');
    const payload = generateMockLead();
    sendLeadPayload(payload, customTarget).then((res) => {
      process.exit(res.success ? 0 : 1);
    });
  } else {
    const intervalMs = customInterval ? parseInt(customInterval, 10) : undefined;
    startSimulator({ targetUrl: customTarget, intervalMs, initialDelayMs: 500 });

    const handleShutdown = () => {
      console.log('\n[AdSimulator] Shutdown signal received.');
      stopSimulator();
      process.exit(0);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  }
}

module.exports = {
  generateMockLead,
  sendLeadPayload,
  startSimulator,
  stopSimulator,
  getStats,
  resetStats
};
