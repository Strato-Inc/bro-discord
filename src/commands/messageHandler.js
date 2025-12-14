const pointsService = require('../services/pointsService');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Check if user has any of the required roles to modify points
 * @param {GuildMember} member - Guild member object
 * @returns {boolean} True if user has any of the allowed roles
 */
function hasPointGiverRole(member) {
  if (!member || !member.roles) {
    return false;
  }
  
  // Check if user has any of the allowed roles
  return member.roles.cache.some(
    role => config.pointGiverRoleNames.includes(role.name)
  );
}

/**
 * Handle point giving (++ command)
 * @param {Message} message - Discord message object
 * @param {User} targetUser - User to give points to
 */
async function handlePointGive(message, targetUser) {
  try {
    // Check permissions
    const member = await message.member.fetch();
    if (!hasPointGiverRole(member)) {
      await message.reply("You don't have permission to modify points.");
      logger.warn(`User ${message.author.username} tried to give points without permission`);
      return;
    }
    
    // Prevent self-pointing
    if (targetUser.id === message.author.id) {
      await message.reply("You can't give points to yourself.");
      logger.warn(`User ${message.author.username} tried to give points to themselves`);
      return;
    }
    
    // Give the point
    const newScore = await pointsService.givePoint(targetUser.id);
    await message.reply(`${targetUser.username} received +1 | Total: ${newScore}`);
    logger.info(`Point given: ${message.author.username} → ${targetUser.username} (${newScore})`);
  } catch (error) {
    logger.error('Error in handlePointGive:', error);
    try {
      await message.reply('Sorry, I encountered an error while processing that.');
    } catch (replyError) {
      logger.error('Error replying to point give:', replyError);
    }
  }
}

/**
 * Handle point removal (-- command)
 * @param {Message} message - Discord message object
 * @param {User} targetUser - User to remove points from
 */
async function handlePointRemove(message, targetUser) {
  try {
    // Check permissions
    const member = await message.member.fetch();
    if (!hasPointGiverRole(member)) {
      await message.reply("You don't have permission to modify points.");
      logger.warn(`User ${message.author.username} tried to remove points without permission`);
      return;
    }
    
    // Prevent self-pointing
    if (targetUser.id === message.author.id) {
      await message.reply("You can't remove points from yourself.");
      logger.warn(`User ${message.author.username} tried to remove points from themselves`);
      return;
    }
    
    // Remove the point
    const newScore = await pointsService.removePoint(targetUser.id);
    await message.reply(`${targetUser.username} lost 1 | Total: ${newScore}`);
    logger.info(`Point removed: ${message.author.username} → ${targetUser.username} (${newScore})`);
  } catch (error) {
    logger.error('Error in handlePointRemove:', error);
    try {
      await message.reply('Sorry, I encountered an error while processing that.');
    } catch (replyError) {
      logger.error('Error replying to point remove:', replyError);
    }
  }
}

/**
 * Main message handler
 * @param {Message} message - Discord message object
 * @param {Client} client - Discord client
 */
async function handleMessage(message, client) {
  // Ignore bot messages
  if (message.author.bot) {
    return;
  }
  
  // Ignore DMs
  if (!message.guild) {
    return;
  }
  
  const content = message.content.trim();
  
  // Check for point giving/removing (++ or -- at the end with mention)
  if (content.endsWith('++') || content.endsWith('--')) {
    const mentions = message.mentions.users;
    
    if (mentions.size === 0) {
      return; // No mentions, ignore
    }
    
    // Get the first mentioned user
    const targetUser = mentions.first();
    
    if (content.endsWith('++')) {
      await handlePointGive(message, targetUser);
    } else if (content.endsWith('--')) {
      await handlePointRemove(message, targetUser);
    }
    
    return;
  }
  
  // Check for stats command: @Bro stats (case insensitive)
  const botMentioned = message.mentions.has(client.user.id);
  if (botMentioned) {
    // Remove mentions and clean up the message
    let cleanContent = content;
    // Remove bot mention first (format: <@123456789>)
    cleanContent = cleanContent.replace(/<@!?\d+>/g, (match) => {
      // Check if this is the bot's mention
      const userId = match.replace(/<@!?|>/g, '');
      if (userId === client.user.id) {
        return ''; // Remove bot mention
      }
      return match; // Keep other mentions
    }).trim();
    // Remove bot name if it appears as plain text
    cleanContent = cleanContent.replace(new RegExp(`@?${config.botName}`, 'gi'), '').trim();
    cleanContent = cleanContent.replace(new RegExp(`@?${client.user.username}`, 'gi'), '').trim();
    
    // Split into words and check commands
    const words = cleanContent.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length > 0 && words[0] === 'stats') {
      const { handleStatsCommand } = require('./statsCommand');
      await handleStatsCommand(message, client);
      return;
    }
    
    // Check for delete command: @Bro delete @username
    if (words.length > 0 && words[0] === 'delete') {
      // Get all user mentions (excluding bot)
      const userMentions = message.mentions.users.filter(user => user.id !== client.user.id);
      
      if (userMentions.size === 0) {
        await message.reply("Please mention a user to delete from the leaderboard. Usage: @Bro delete @username");
        return;
      }
      
      const targetUser = userMentions.first();
      const { handleDeleteCommand } = require('./deleteCommand');
      await handleDeleteCommand(message, client, targetUser);
      return;
    }
  }
}

module.exports = {
  handleMessage
};

