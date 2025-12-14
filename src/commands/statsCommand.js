const pointsService = require('../services/pointsService');
const logger = require('../utils/logger');

/**
 * Handle the stats command
 * @param {Message} message - Discord message object
 * @param {Client} client - Discord client
 */
async function handleStatsCommand(message, client) {
  try {
    const userId = message.author.id;
    const userScore = await pointsService.getUserScore(userId);
    const leaderboard = await pointsService.getLeaderboard(10);
    
    // Build leaderboard text
    let leaderboardText = '';
    
    if (leaderboard.length === 0) {
      leaderboardText = 'No users on the leaderboard yet.';
    } else {
      for (let i = 0; i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        // Use Discord mention format <@user_id> for proper tagging
        leaderboardText += `<@${entry.user_id}> — ${entry.score}\n`;
      }
    }
    
    const statsMessage = `Stats for ${message.author.username}\n` +
                        `Your Points: ${userScore}\n\n` +
                        `Leaderboard:\n${leaderboardText}`;
    
    await message.reply(statsMessage);
    logger.info(`Stats command executed by ${message.author.username} (${userId})`);
  } catch (error) {
    logger.error('Error in handleStatsCommand:', error);
    try {
      await message.reply('Sorry, I encountered an error while fetching stats.');
    } catch (replyError) {
      logger.error('Error replying to stats command:', replyError);
    }
  }
}

module.exports = {
  handleStatsCommand
};

