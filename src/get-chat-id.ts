import { Bot } from 'grammy';
import fs from 'fs';
import path from 'path';

// Simple .env file loader
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

// Proxy support
if (process.env.http_proxy && !process.env.HTTP_PROXY) {
  process.env.HTTP_PROXY = process.env.http_proxy;
}
if (process.env.https_proxy && !process.env.HTTPS_PROXY) {
  process.env.HTTPS_PROXY = process.env.https_proxy;
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set. Run npm run auth first.');
  process.exit(1);
}

console.log('Listening for messages...');
console.log('Please send a message to your bot in Telegram.\n');

const bot = new Bot(BOT_TOKEN);

bot.on('message', (ctx) => {
  const chatId = ctx.chat.id.toString();
  const chatType = ctx.chat.type;
  const userName = ctx.from.first_name + (ctx.from.last_name ? ' ' + ctx.from.last_name : '');

  console.log('\n✅ Received message!');
  console.log(`Chat ID: ${chatId}`);
  console.log(`Chat Type: ${chatType}`);
  console.log(`User: ${userName}`);

  if (chatType === 'private') {
    console.log('\n📝 This is your private chat ID. Use this for the main channel.');
    ctx.reply('Your chat ID is: ' + chatId);
  } else {
    console.log('\n📝 This is a group chat ID.');
    ctx.reply('This group chat ID is: ' + chatId);
  }

  console.log('\nPress Ctrl+C to exit.');
});

bot.start();
