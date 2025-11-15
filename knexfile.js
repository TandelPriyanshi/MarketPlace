require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'marketplace_dev',
    },
    migrations: {
      directory: './server/src/db/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './server/src/db/seeds',
    },
  },
  test: {
    client: 'mysql',
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '3306'),
      user: process.env.TEST_DB_USERNAME || 'root',
      password: process.env.TEST_DB_PASSWORD || 'password',
      database: process.env.TEST_DB_NAME || 'marketplace_test',
    },
    migrations: {
      directory: './server/src/db/migrations',
      tableName: 'knex_migrations',
    },
  },
  production: {
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './server/src/db/migrations',
      tableName: 'knex_migrations',
    },
  },
};
