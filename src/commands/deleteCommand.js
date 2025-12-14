const pointsService = require('../services/pointsService');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Check if user has any of the required roles to delete users
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
 * Handle the delete command
 * @param {Message} message - Discord message object
 * @param {Client} client - Discord client
 * @param {User} targetUser - User to delete from leaderboard
 */
async function handleDeleteCommand(message, client, targetUser) {
  try {
    // Check permissions
    const member = await message.member.fetch();
    if (!hasPointGiverRole(member)) {
      await message.reply("You don't have permission to delete users from the leaderboard.");
      logger.warn(`User ${message.author.username} tried to delete user without permission`);
      return;
    }
    
    if (!targetUser) {
      await message.reply("Please mention a user to delete from the leaderboard. Usage: @Bro delete @username");
      return;
    }
    
    // Delete the user from leaderboard
    const deleted = await pointsService.deleteUser(targetUser.id);
    
    if (deleted) {
      await message.reply(`Successfully deleted ${targetUser.username} from the leaderboard.`);
      logger.info(`User deleted: ${message.author.username} deleted ${targetUser.username} (${targetUser.id})`);
    } else {
      await message.reply(`${targetUser.username} is not on the leaderboard.`);
      logger.info(`Delete attempted on non-existent user: ${targetUser.username} (${targetUser.id})`);
    }
  } catch (error) {
    logger.error('Error in handleDeleteCommand:', error);
    try {
      await message.reply('Sorry, I encountered an error while deleting that user.');
    } catch (replyError) {
      logger.error('Error replying to delete command:', replyError);
    }
  }
}

module.exports = {
  handleDeleteCommand
};

