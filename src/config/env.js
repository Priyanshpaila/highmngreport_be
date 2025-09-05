import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 8000),
  apiBase: process.env.API_BASE || '/api',
  mongoUri: process.env.MONGO_URI,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET
  },
  appUrl: process.env.PUBLIC_APP_URL || 'http://localhost:5173'
};
