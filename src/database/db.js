const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config/config');

let db = null;

/**
 * Initialize the database connection and create tables if needed
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.resolve(config.databaseFile);
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Failed to connect to database:', err);
        reject(err);
        return;
      }
      
      logger.info(`Database connected: ${dbPath}`);
      
      // Create points table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS points (
          user_id TEXT PRIMARY KEY,
          score INTEGER NOT NULL DEFAULT 0
        )
      `, (err) => {
        if (err) {
          logger.error('Failed to create points table:', err);
          reject(err);
          return;
        }
        
        logger.info('Database tables initialized');
        resolve();
      });
    });
  });
}

/**
 * Get points for a specific user
 * @param {string} userId - Discord user ID
 * @returns {Promise<number>} User's current score
 */
function getPoints(userId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.get('SELECT score FROM points WHERE user_id = ?', [userId], (err, row) => {
      if (err) {
        logger.error('Error getting points:', err);
        reject(err);
        return;
      }
      
      resolve(row ? row.score : 0);
    });
  });
}

/**
 * Add or subtract points from a user
 * @param {string} userId - Discord user ID
 * @param {number} amount - Amount to add (can be negative)
 * @returns {Promise<number>} New total score
 */
function addPoints(userId, amount) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    // First, try to update existing record
    db.run(
      'UPDATE points SET score = score + ? WHERE user_id = ?',
      [amount, userId],
      function(err) {
        if (err) {
          logger.error('Error updating points:', err);
          reject(err);
          return;
        }
        
        // If no rows were updated, insert a new record
        if (this.changes === 0) {
          db.run(
            'INSERT INTO points (user_id, score) VALUES (?, ?)',
            [userId, amount],
            function(err) {
              if (err) {
                logger.error('Error inserting points:', err);
                reject(err);
                return;
              }
              
              // Get the new score
              getPoints(userId).then(resolve).catch(reject);
            }
          );
        } else {
          // Get the updated score
          getPoints(userId).then(resolve).catch(reject);
        }
      }
    );
  });
}

/**
 * Get leaderboard with top users
 * @param {number} limit - Number of top users to return
 * @returns {Promise<Array<{user_id: string, score: number}>>} Array of top users
 */
function getLeaderboard(limit = 10) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.all(
      'SELECT user_id, score FROM points ORDER BY score DESC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) {
          logger.error('Error getting leaderboard:', err);
          reject(err);
          return;
        }
        
        resolve(rows || []);
      }
    );
  });
}

/**
 * Delete a user from the leaderboard
 * @param {string} userId - Discord user ID
 * @returns {Promise<boolean>} True if user was deleted, false if user didn't exist
 */
function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }
    
    db.run('DELETE FROM points WHERE user_id = ?', [userId], function(err) {
      if (err) {
        logger.error('Error deleting user:', err);
        reject(err);
        return;
      }
      
      resolve(this.changes > 0);
    });
  });
}

/**
 * Close database connection
 */
function closeDatabase() {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
        } else {
          logger.info('Database connection closed');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initializeDatabase,
  getPoints,
  addPoints,
  getLeaderboard,
  deleteUser,
  closeDatabase
};

