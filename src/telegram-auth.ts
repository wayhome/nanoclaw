import { Bot } from 'grammy';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

// Simple .env file loader (for development/testing)
function loadEnv(): void {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

// Node.js fetch requires uppercase proxy variables
if (process.env.http_proxy && !process.env.HTTP_PROXY) {
  process.env.HTTP_PROXY = process.env.http_proxy;
}
if (process.env.https_proxy && !process.env.HTTPS_PROXY) {
  process.env.HTTPS_PROXY = process.env.https_proxy;
}

console.log('[DEBUG] Environment loaded');

const logger = pino({ level: 'info' });
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

console.log('[DEBUG] BOT_TOKEN:', BOT_TOKEN ? 'SET' : 'NOT SET');

async function authenticate() {
  console.log('[DEBUG] Starting authentication...');
  if (!BOT_TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN not set\n');
    console.log('To get a bot token:');
    console.log('1. Open Telegram and search for @BotFather');
    console.log('2. Send /newbot and follow instructions');
    console.log('3. Copy the token and add to .env file:');
    console.log('   TELEGRAM_BOT_TOKEN=your_token_here\n');
    process.exit(1);
  }

  try {
    console.log('[DEBUG] Testing API connection with Grammy...');
    const bot = new Bot(BOT_TOKEN);
    const me = await bot.api.getMe();

    console.log('✅ Successfully authenticated with Telegram!\n');
    console.log(`Bot username: @${me.username}`);
    console.log(`Bot name: ${me.first_name}`);
    console.log(`Bot ID: ${me.id}\n`);
    console.log('You can now start the NanoClaw service.\n');

    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Authentication failed');
    console.error('❌ Failed to authenticate. Check your bot token.\n');
    console.error('Error details:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

authenticate();
