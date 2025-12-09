const db = require('../database/db');
const logger = require('../utils/logger');

/**
 * Give a point to a user
 * @param {string} userId - Discord user ID
 * @returns {Promise<number>} New total score
 */
async function givePoint(userId) {
  try {
    const newScore = await db.addPoints(userId, 1);
    logger.info(`Gave point to user ${userId}, new score: ${newScore}`);
    return newScore;
  } catch (error) {
    logger.error('Error in givePoint:', error);
    throw error;
  }
}

/**
 * Remove a point from a user
 * @param {string} userId - Discord user ID
 * @returns {Promise<number>} New total score
 */
async function removePoint(userId) {
  try {
    const newScore = await db.addPoints(userId, -1);
    logger.info(`Removed point from user ${userId}, new score: ${newScore}`);
    return newScore;
  } catch (error) {
    logger.error('Error in removePoint:', error);
    throw error;
  }
}

/**
 * Get user's current score
 * @param {string} userId - Discord user ID
 * @returns {Promise<number>} User's current score
 */
async function getUserScore(userId) {
  try {
    const score = await db.getPoints(userId);
    return score;
  } catch (error) {
    logger.error('Error in getUserScore:', error);
    throw error;
  }
}

/**
 * Get leaderboard
 * @param {number} limit - Number of top users to return
 * @returns {Promise<Array<{user_id: string, score: number}>>} Array of top users
 */
async function getLeaderboard(limit = 10) {
  try {
    const leaderboard = await db.getLeaderboard(limit);
    return leaderboard;
  } catch (error) {
    logger.error('Error in getLeaderboard:', error);
    throw error;
  }
}

module.exports = {
  givePoint,
  removePoint,
  getUserScore,
  getLeaderboard
};

