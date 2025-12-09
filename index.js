const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/config/config');
const db = require('./src/database/db');
const messageHandler = require('./src/commands/messageHandler');
const logger = require('./src/utils/logger');

// Create Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Initialize bot
async function initializeBot() {
  try {
    // Initialize database
    await db.initializeDatabase();
    logger.info('Database initialized');
    
    // Login to Discord
    await client.login(config.botToken);
    logger.info('Bot logged in successfully');
  } catch (error) {
    logger.error('Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Bot ready event
client.once('ready', () => {
  logger.info(`Bot is ready! Logged in as ${client.user.tag}`);
  logger.info(`Bot name configured as: ${config.botName}`);
  logger.info(`Point giver roles: ${config.pointGiverRoleNames.join(', ')}`);
  client.user.setActivity('for point commands', { type: 'WATCHING' });
});

// Message create event
client.on('messageCreate', async (message) => {
  try {
    await messageHandler.handleMessage(message, client);
  } catch (error) {
    logger.error('Error handling message:', error);
  }
});

// Error handling
client.on('error', (error) => {
  logger.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down bot...');
  await db.closeDatabase();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down bot...');
  await db.closeDatabase();
  client.destroy();
  process.exit(0);
});

// Start the bot
initializeBot();

