# Discord Points Bot

A production-ready Discord bot for managing user points with a leaderboard system. Users can give or remove points from others, and view their stats and the global leaderboard.

## Features

- Point giving system (`@user++`)
- Point removal system (`@user--`)
- Stats and leaderboard (`@Bro stats`)
- Role-based permissions
- Self-pointing prevention
- SQLite database for persistence
- Railway-ready deployment

## Prerequisites

- Node.js 18.0.0 or higher
- A Discord Bot Token
- Discord Developer Portal access

## Setup Instructions

### 1. Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot" and confirm
5. Under "Privileged Gateway Intents", enable:
   - Server Members Intent
   - Message Content Intent
6. Under **"TOKEN"** section, click **"Reset Token"** or **"Copy"** to get your bot token
   - ⚠️ **IMPORTANT:** Copy this token immediately - you won't be able to see it again!
   - This is the `DISCORD_TOKEN` you'll use in your `.env` file
7. Go to "OAuth2" → "URL Generator"
8. Select scopes:
   - `bot`
   - `applications.commands` (optional, not required for this bot)
9. Select bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History
10. Copy the generated invite URL and use it to invite your bot to your server

### 2. Local Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   BOT_NAME=Bro
   POINT_GIVER_ROLE_NAMES=b28,b27,b26
   DATABASE_FILE=./points.db
   ```

4. Replace `your_bot_token_here` with your actual bot token from the Discord Developer Portal (step 6 above)
   - The token looks like:

### 3. Create the Point Giver Roles

1. In your Discord server, go to **Server Settings** → **Roles**
2. Create the roles that should be able to give/remove points (e.g., `b28`, `b27`, `b26`)
3. In your `.env` file, set `POINT_GIVER_ROLE_NAMES` to a comma-separated list of role names:
   ```env
   POINT_GIVER_ROLE_NAMES=b28,b27,b26
   ```
   - Users with **ANY** of these roles can give/remove points
   - For a single role, just use: `POINT_GIVER_ROLE_NAMES=PointGiver`
4. Assign these roles to users who should be able to give/remove points
5. Regular users without these roles can still use the stats command

### 4. Run the Bot

```bash
npm start
```

The bot should now be online and ready to use!

## Commands

### Give Points
```
@username++
```
- Adds +1 point to the mentioned user
- Requires one of the configured point giver roles (see Configuration)
- Cannot give points to yourself
- Example: `@John++`

### Remove Points
```
@username--
```
- Removes -1 point from the mentioned user
- Requires one of the configured point giver roles (see Configuration)
- Cannot remove points from yourself
- Example: `@John--`

### View Stats
```
@Bro stats
```
- Shows your current points
- Shows the global top 10 leaderboard
- Available to everyone (no role required)
- Example: `@Bro stats`

**Note:** Replace `Bro` with your configured `BOT_NAME` if different.

## Configuration

All configuration is done via environment variables in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Your Discord bot token (required) | - |
| `BOT_NAME` | The bot's name for stats command | `Bro` |
| `POINT_GIVER_ROLE_NAMES` | Comma-separated list of role names that can modify points | `PointGiver` |
| `DATABASE_FILE` | Path to SQLite database file | `./points.db` |

**Note:** `POINT_GIVER_ROLE_NAMES` accepts multiple roles separated by commas. Users with **ANY** of these roles can give/remove points. Example: `POINT_GIVER_ROLE_NAMES=b28,b27,b26`

## Project Structure

```
.
├── index.js                 # Main entry point
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (create this)
├── .env.example            # Example environment file
├── .gitignore              # Git ignore rules
├── Dockerfile              # Docker configuration
├── Procfile                # Railway/Heroku process file
├── README.md               # This file
└── src/
    ├── config/
    │   └── config.js       # Configuration loader
    ├── database/
    │   └── db.js           # Database operations
    ├── services/
    │   └── pointsService.js # Business logic layer
    ├── commands/
    │   ├── messageHandler.js # Message processing
    │   └── statsCommand.js   # Stats command handler
    └── utils/
        └── logger.js       # Logging utility
```

## Database

The bot uses SQLite to store user points. The database file is created automatically on first run.

**Table: `points`**
- `user_id` (TEXT, PRIMARY KEY) - Discord user ID
- `score` (INTEGER) - User's current point total

## Deployment to Railway

1. Create a Railway account at [railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository (or deploy directly)
4. **IMPORTANT: Add environment variables BEFORE the bot starts:**
   - Click on your project in Railway
   - Click on the **"Variables"** tab (or go to your service → Variables)
   - Click **"New Variable"** or **"Raw Editor"**
   - Add these variables (one per line, or use the form):
     ```
     DISCORD_TOKEN=your_actual_bot_token_here
     BOT_NAME=Bro
     POINT_GIVER_ROLE_NAMES=b28,b27,b26
     DATABASE_FILE=/app/data/points.db
     ```
   - Click **"Save"** or **"Deploy"**
5. Railway will automatically detect the `Procfile` and deploy
6. The bot will start automatically once `DISCORD_TOKEN` is set

### Railway Environment Variables Setup

**Step-by-step:**
1. In Railway dashboard, select your project
2. Click on your service (the deployed app)
3. Go to the **"Variables"** tab
4. Click **"New Variable"** for each variable, OR click **"Raw Editor"** to add multiple at once
5. Add these exact variable names and values:
   - `DISCORD_TOKEN` = `your_bot_token_from_discord_developer_portal`
   - `BOT_NAME` = `Bro` (optional)
   - `POINT_GIVER_ROLE_NAMES` = `b28,b27,b26` (your roles, comma-separated)
   - `DATABASE_FILE` = `/app/data/points.db` (optional, for persistence)

**⚠️ Important Notes:**
- **DO NOT** include quotes around the values
- **DO NOT** use `DISCORD_TOKEN=your_bot_token_here` - use your actual token
- Variables are case-sensitive: `DISCORD_TOKEN` not `discord_token`
- After adding variables, Railway will automatically redeploy
- If the bot crashes with "DISCORD_TOKEN is required", check that the variable name is exactly `DISCORD_TOKEN` (all caps)

## Docker Deployment

You can also deploy using Docker:

```bash
docker build -t discord-points-bot .
docker run -d --env-file .env discord-points-bot
```

## Safety Features

- Never crashes on database failures (graceful error handling)
- Logs all major actions
- Handles empty leaderboards gracefully
- Handles missing roles safely
- Validates all mentions before processing
- Prevents self-pointing
- Ignores bot messages and DMs

## Troubleshooting

### Railway: "DISCORD_TOKEN is required" error

If you see this error in Railway logs:

1. **Check that the variable is set:**
   - Go to Railway dashboard → Your Project → Your Service → Variables tab
   - Verify `DISCORD_TOKEN` exists (exact spelling, all caps)
   - Check that the value is not empty

2. **Verify the variable name:**
   - Must be exactly: `DISCORD_TOKEN` (not `DISCORD_BOT_TOKEN`, `TOKEN`, etc.)
   - Case-sensitive: all uppercase

3. **Check for extra characters:**
   - Make sure there are no quotes around the token value
   - No spaces before/after the token
   - Copy the token directly from Discord Developer Portal

4. **Redeploy after adding variables:**
   - After adding/changing variables, Railway should auto-redeploy
   - If not, manually trigger a redeploy

5. **View logs to confirm:**
   - Check Railway logs to see if the variable is being read
   - The bot should log "Bot logged in successfully" if the token is correct

### Bot doesn't respond
- Check that the bot is online in your server
- Verify the bot has "Read Messages" and "Send Messages" permissions
- Check that Message Content Intent is enabled in Discord Developer Portal

### Permission errors
- Verify the point giver roles exist in your server (e.g., `b28`, `b27`, `b26`)
- Check that users have at least one of the configured roles assigned
- Ensure the role names in environment variables match exactly (case-sensitive)
- For multiple roles, use comma-separated format: `POINT_GIVER_ROLE_NAMES=b28,b27,b26`

### Database errors
- Check file permissions for the database file
- Ensure the directory exists for the database path
- On Railway, use `/app/data/points.db` for persistent storage

## License

MIT

## Support

For issues or questions, please check:
1. That all environment variables are set correctly
2. That the bot has proper permissions in your server
3. That the required Discord intents are enabled
4. The logs for any error messages

