# Changelog

## 2026-02-03 - Telegram Migration & Improvements

### Major Changes

#### 1. Telegram Integration
- **Migrated from WhatsApp to Telegram**
  - Replaced Baileys library with Grammy (Telegram bot framework)
  - Updated authentication to use bot tokens from @BotFather
  - Implemented Grammy's native polling (no curl dependency)
  - Updated database schema (renamed `jid` columns to `chat_id`)

#### 2. Continuous Typing Indicator
- **Problem**: Telegram's typing indicator expires after 5 seconds, but agent processing takes 20-40 seconds, leaving users uncertain if the bot is working
- **Solution**: Implemented auto-refreshing typing indicator
  - Starts when message processing begins
  - Refreshes every 4 seconds (before 5-second expiration)
  - Stops when response is sent or on error
- **Files modified**:
  - `src/index.ts` - Added `startTypingIndicator()` and `stopTypingIndicator()` functions
  - Uses `setInterval` to periodically refresh the typing action

#### 3. Native Grammy Polling
- **Removed curl-based manual polling** - Simplified to use Grammy's native API
- **Files modified**:
  - `src/index.ts` - Removed `startTelegramPolling` function, use `bot.start()`
  - `src/telegram-auth.ts` - Use `bot.api.getMe()` instead of curl
- **Benefits**: Cleaner code, standard Grammy usage, no external dependencies

### Bug Fixes

#### 1. Group Settings Configuration
- **Problem**: New groups failed with "Could not resolve authentication method" error
- **Root cause**: Settings file was placed in wrong location
  - Incorrect: `data/sessions/{group}/.claude/settings.json`
  - Correct: `groups/{group}/.claude/settings.json`
- **Reason**: Agent-runner uses `settingSources: ['project']`, which looks for settings in the mounted project directory (`/workspace/group/.claude/`), not the user home directory
- **Solution**: Updated setup documentation to specify correct settings location

#### 2. Message Reception in Groups
- **Problem**: Bot not receiving group messages despite being added to group
- **Root cause**: Bot privacy mode was enabled
- **Solution**: Documented requirement to disable privacy mode via @BotFather

### Documentation Updates

#### 1. Updated Core Documentation
- **CLAUDE.md**: Updated references from WhatsApp to Telegram, added new features
- **README.md**: Updated architecture diagram, FAQ, and feature list
- **.env.example**: Added all required environment variables with descriptions

#### 2. New Documentation
- **docs/GROUP_SETUP.md**: Comprehensive guide for setting up new Telegram groups
  - Step-by-step instructions
  - Troubleshooting section
  - Common issues and solutions

### Configuration Changes

#### Environment Variables
Required variables:
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `ASSISTANT_NAME` - Trigger name (default: Andy)
- `ANTHROPIC_AUTH_TOKEN` - Claude API key
- `ANTHROPIC_BASE_URL` - Optional custom API endpoint
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` - Optional traffic optimization

### Technical Details

#### Trigger Pattern Implementation
```typescript
// Simple trigger pattern matching @AssistantName at start of message
TRIGGER_PATTERN = /^@Andy\b/i
```

#### Typing Indicator Implementation
```typescript
// Refresh every 4 seconds (Telegram typing expires after 5 seconds)
const interval = setInterval(() => {
  setTyping(chatId, true);
}, 4000);
```

### Migration Notes

For users migrating from WhatsApp-based NanoClaw:
1. Database schema is compatible (column renames are backward compatible)
2. Group folder structure remains the same
3. Each group needs `.claude/settings.json` in the correct location
4. Update environment variables in `.env` file

### Known Issues

None at this time.

### Future Improvements

Potential enhancements:
- Add support for Telegram message entities (bold, italic, code blocks)
- Implement message editing for long responses
- Add support for Telegram inline keyboards
- Optimize typing indicator to stop during API calls (currently runs throughout)

