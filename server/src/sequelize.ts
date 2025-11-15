import { Sequelize } from 'sequelize';
import { currentConfig  } from '../src/config/config';

const dbConfig = currentConfig.db;

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: {
      max: dbConfig.pool?.max || 5,
      min: dbConfig.pool?.min || 0,
      acquire: dbConfig.pool?.acquire || 30000,
      idle: dbConfig.pool?.idle || 10000,
    },
    dialectOptions: {
      ...(process.env.DB_SSL === 'true' && {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }),
    },
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Uncomment for testing connection on startup
// testConnection();

export { sequelize, testConnection };