import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().required().min(32),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.number().default(900),
  JWT_REFRESH_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.number().default(604800),

  // QR
  QR_JWT_SECRET: Joi.string().optional(),
  QR_JWT_EXPIRES_IN: Joi.string().default('365d'),

  // CORS
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:4200'),

  // Frontend URL
  FRONTEND_URL: Joi.string().default('http://localhost:4200'),

  // Firebase
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
});
