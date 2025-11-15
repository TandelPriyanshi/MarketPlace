// src/config/config.ts
import dotenv from 'dotenv';

dotenv.config();

type Environment = 'development' | 'test' | 'production';

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect?: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
  logging?: boolean | ((sql: string, timing?: number) => void);
  pool?: {
    max?: number;
    min?: number;
    acquire?: number;
    idle?: number;
  };
}

interface Config {
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  db: DatabaseConfig;
  uploads: {
    maxFileSize: number;
    allowedMimeTypes: string[];
  };
}

const baseConfig: Omit<Config, 'db'> & { db: Omit<DatabaseConfig, 'dialect' | 'logging' | 'pool'> } = {
  port: parseInt(process.env.PORT || '3000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV,
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'marketplace',
  },
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
  },
};

const config: Record<Environment, Config> = {
  development: {
    ...baseConfig,
    db: {
      ...baseConfig.db,
      dialect: 'mysql',
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  },
  test: {
    ...baseConfig,
    db: {
      ...baseConfig.db,
      database: 'marketplace_test',
      dialect: 'mysql',
      logging: false,
    },
  },
  production: {
    ...baseConfig,
    db: {
      ...baseConfig.db,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000,
      },
    },
  },
};

// Update the export in config.ts
export const currentConfig = config[process.env.NODE_ENV as Environment || 'development'];
export { config };