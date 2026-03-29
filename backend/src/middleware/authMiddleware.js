const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Requires one of these roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};

// 🔐 Convenience middleware for specific roles
const allowStaff = roleMiddleware(['staff']);
const allowDoctor = roleMiddleware(['doctor']);
const allowPatient = roleMiddleware(['patient']);

module.exports = { authMiddleware, roleMiddleware, allowStaff, allowDoctor, allowPatient };
