import { config } from 'dotenv';
import { version } from '../package.json';

config();

const env = (key: string, defaultVal: any = undefined) =>
  process.env[key] || defaultVal;

env.require = (key: string, defaultVal: any = undefined) => {
  const value = process.env[key] || defaultVal;

  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }

  return value;
};

const configuration = {
  environment: env.require('NODE_ENV', 'development'),

  app: {
    name: env.require('APP_NAME', 'Server'),
    port: parseInt(env('APP_PORT', 3001)),
    hostname: env('APP_HOSTNAME', '0.0.0.0'),
    host: env(
      'APP_HOST',
      `http://localhost:${parseInt(env('APP_PORT', 3001))}`,
    ),
    description: env('APP_DESCRIPTION', 'Server'),
    version,
  },

  db: {
    url: env.require('DATABASE_URL'),
  },

  redis: {
    host: env.require('REDIS_HOST', 'localhost'),
    port: parseInt(env('REDIS_PORT', '6543')),
    password: env('REDIS_PASSWORD'),
    cacheTtl: parseInt(env('CACHE_TTL', 3600000)),
    url: env('REDIS_URL'),
  },

  jwt: {
    secret: env.require('JWT_SECRET'),
    signOptions: {
      expiresIn: parseInt(env.require('JWT_EXPIRES', 30 * 60)),
    },
  },

  swagger: {
    user: {
      [env('SWAGGER_USER_NAME', 'swaggerAdmin')]: env(
        'SWAGGER_USER_PASSWORD',
        '12345@',
      ),
    },
  },
};

export default () => configuration;
