const jwt = require('jsonwebtoken');

// Basic authentication middleware
exports.authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Optional authentication middleware - proceeds without user if no or invalid token
exports.optionalAuthenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    }
    next();
  });
};

// Role-based authorization middleware
exports.requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.user.userRole;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

// Specific role middlewares for convenience
exports.requireAdmin = exports.requireRole(['admin']);
exports.requireTeacher = exports.requireRole(['teacher', 'admin']);
exports.requireTeacherOrAssistant = exports.requireRole(['teacher', 'assistant', 'admin']);
exports.requireStudent = exports.requireRole(['student', 'teacher', 'assistant', 'admin']);