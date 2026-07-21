import User from '../models/User.js';
import ReputationHistory from '../models/ReputationHistory.js';

/**
 * Adjust user reputation score and log the action to ReputationHistory.
 * @param {string} userId 
 * @param {number} points 
 * @param {string} action 
 * @param {string} [referenceId] 
 * @param {string} [referenceType] 
 */
export const adjustReputation = async (userId, points, action, referenceId = null, referenceType = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Apply adjustments, bound it above 0
    user.reputation = Math.max(0, user.reputation + points);
    await user.save();

    // Create history logs
    const history = await ReputationHistory.create({
      userId,
      points,
      action,
      referenceId,
      referenceType
    });

    console.log(`[Reputation Service] Adjusted user ${user.name} (${userId}) by ${points} points (Action: ${action})`);
    return { user, history };
  } catch (error) {
    console.error(`[Reputation Error] Failed to adjust reputation: ${error.message}`);
    return null;
  }
};
