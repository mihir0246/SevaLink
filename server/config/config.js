// Centralized config — mirrors OVP's config.ts
const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/sevalink',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiry: '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

module.exports = config;
