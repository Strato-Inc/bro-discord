require('dotenv').config();

// Parse comma-separated role names into an array
function parseRoleNames(roleNamesString) {
  if (!roleNamesString) {
    return ['PointGiver']; // Default role
  }
  
  return roleNamesString
    .split(',')
    .map(role => role.trim())
    .filter(role => role.length > 0);
}

const config = {
  botToken: process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.trim() : null,
  botName: process.env.BOT_NAME ? process.env.BOT_NAME.trim() : 'Bro',
  pointGiverRoleNames: parseRoleNames(process.env.POINT_GIVER_ROLE_NAMES || process.env.POINT_GIVER_ROLE_NAME),
  databaseFile: process.env.DATABASE_FILE ? process.env.DATABASE_FILE.trim() : './points.db'
};

// Validate required config
if (!config.botToken) {
  console.error('ERROR: DISCORD_TOKEN environment variable is required');
  console.error('');
  console.error('For local development: Create a .env file with DISCORD_TOKEN=your_token');
  console.error('For Railway: Set DISCORD_TOKEN in your project Variables tab');
  console.error('For Docker: Pass DISCORD_TOKEN as an environment variable');
  process.exit(1);
}

module.exports = config;

