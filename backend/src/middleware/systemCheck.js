const SystemStatus = require('../models/SystemStatus');

/**
 * Middleware to check if system is frozen
 * If frozen, blocks write operations
 * Read operations are allowed even if frozen
 */
module.exports = async (req, res, next) => {
  try {
    // Only block certain operations if system is frozen
    const writeOperations = ['POST', 'PUT', 'DELETE', 'PATCH'];
    
    if (writeOperations.includes(req.method)) {
      const status = await SystemStatus.getInstance();
      
      if (status.isFrozen) {
        console.warn('⛔ Write operation blocked - system is frozen:', status.reason);
        return res.status(403).json({
          message: 'System temporarily locked due to security issue',
          reason: status.reason,
          frozenAt: status.frozenAt
        });
      }
    }

    // Proceed if not a write operation or system not frozen
    next();
  } catch (err) {
    console.error('❌ Error in systemCheck middleware:', err);
    // Continue anyway - don't block due to middleware error
    next();
  }
};
