const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || '12345678';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: 'No authorization header provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided in authorization header' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify that the token contains necessary user information
    if (!decoded.cin || !decoded.role) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token structure' 
      });
    }

    // Store decoded user info in request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token',
      error: err.message 
    });
  }
};

module.exports = authenticateToken;