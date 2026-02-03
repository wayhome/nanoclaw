# Setting Up a New Telegram Group

This guide explains how to add a new Telegram group to NanoClaw.

## Prerequisites

- Bot must be added to the Telegram group
- Bot privacy mode must be disabled (via @BotFather: `/setprivacy` → select bot → disable)
- You need the group's chat ID

## Step 1: Get the Group Chat ID

### Method 1: From Database (if bot received messages)

```bash
sqlite3 data/nanoclaw.db "
  SELECT chat_id, name, last_message_time
  FROM chats
  WHERE chat_id LIKE '-%'
  ORDER BY last_message_time DESC
  LIMIT 10;
"
```

### Method 2: From Telegram API (if app is stopped)

```bash
# Stop the app first
pkill -f "tsx src/index.ts"

# Get updates
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates" | jq '.result[-1].message.chat'

# Restart the app
npm run dev
```

## Step 2: Register the Group

Edit `data/registered_groups.json` and add the new group:

```json
{
  "existing_group_id": { ... },
  "-100XXXXXXXXXX": {
    "name": "Group Name",
    "folder": "group-folder-name",
    "trigger": "@Andy",
    "added_at": "2026-02-03T08:33:47.000Z"
  }
}
```

**Folder naming convention:**
- Use lowercase
- Replace spaces with hyphens
- Example: "Study Group" → "study-group"

## Step 3: Create Group Directory Structure

```bash
# Create the group folder
mkdir -p groups/group-folder-name/logs

# Create the .claude directory for settings
mkdir -p groups/group-folder-name/.claude
```

## Step 4: Copy Claude API Settings

**CRITICAL:** Each group needs its own `.claude/settings.json` file in the group's project directory.

```bash
# Copy from main group
cp groups/main/.claude/settings.json groups/group-folder-name/.claude/settings.json
```

The settings file should contain:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_api_key",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

**Why this location?**
- The agent-runner uses `settingSources: ['project']`
- This means it looks for settings in `/workspace/group/.claude/` (the mounted group directory)
- NOT in `/home/node/.claude/` (the user home directory)

## Step 5: Create Group Memory File (Optional)

Create `groups/group-folder-name/CLAUDE.md`:

```markdown
# Group Name

This is the memory file for [Group Name].

## Group Information

- **Group Name**: Group Name
- **Trigger**: @Andy
- **Created**: 2026-02-03

## Group Purpose

[Describe the group's purpose]

## Memory and Context

[Add group-specific memory and context here]
```

## Step 6: Restart the Application

```bash
# Stop the app
pkill -f "tsx src/index.ts"

# Start the app
npm run dev
```

## Step 7: Test

Send a message in the Telegram group:

```
@Andy hello
```

Or use the bot's username (Telegram autocomplete):

```
@bot_username hello
```

The bot should:
1. Show "typing..." indicator throughout processing
2. Respond with a message

## Troubleshooting

### Bot not responding

**Check logs:**
```bash
tail -f logs/app.log
```

**Common issues:**

1. **Trigger pattern not matching**
   - Logs show: `triggerMatches: false`
   - Solution: Ensure `BOT_USERNAME` is set in `.env`

2. **Authentication error**
   - Logs show: `Could not resolve authentication method`
   - Solution: Verify `groups/group-folder-name/.claude/settings.json` exists and contains valid API credentials

3. **Group not registered**
   - Logs show: `Message from unregistered group`
   - Solution: Add group to `data/registered_groups.json`

4. **Bot not receiving messages**
   - No logs when sending messages
   - Solution: Disable privacy mode via @BotFather

### Check container logs

```bash
# List recent container logs
ls -lt groups/group-folder-name/logs/ | head -5

# View the most recent log
cat groups/group-folder-name/logs/container-*.log | tail -100
```

### Check Claude Code debug logs

```bash
# List recent debug logs
ls -lt data/sessions/group-folder-name/.claude/debug/ | head -5

# View the most recent debug log
tail -100 data/sessions/group-folder-name/.claude/debug/latest
```

## Group Isolation

Each group has:
- **Isolated filesystem**: Only sees `/workspace/group/` (its own folder)
- **Isolated memory**: Separate `CLAUDE.md` file
- **Isolated settings**: Separate `.claude/settings.json`
- **Isolated sessions**: Separate conversation history

The main group has elevated privileges and can see all groups and the entire project.
