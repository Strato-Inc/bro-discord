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
  botToken: process.env.DISCORD_TOKEN,
  botName: process.env.BOT_NAME || 'Bro',
  pointGiverRoleNames: parseRoleNames(process.env.POINT_GIVER_ROLE_NAMES || process.env.POINT_GIVER_ROLE_NAME),
  databaseFile: process.env.DATABASE_FILE || './points.db'
};

// Validate required config
if (!config.botToken) {
  console.error('ERROR: DISCORD_TOKEN is required in .env file');
  process.exit(1);
}

module.exports = config;

