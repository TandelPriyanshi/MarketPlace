require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'marketplace',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './dist/db/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/db/seeds',
    },
  },
  test: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.TEST_DB_NAME || 'marketplace_test',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './dist/db/migrations',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false,
      } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './dist/db/migrations',
      tableName: 'knex_migrations',
    },
  },
};

