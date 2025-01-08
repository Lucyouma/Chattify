// /backend/config/jwtConfig.js
module.exports = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret',
  expiresIn: process.env.JWT_EXPIRATION || '1h', // Default to 1 hour
};

