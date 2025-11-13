"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = withTransaction;
exports.withReadTransaction = withReadTransaction;
exports.withWriteTransaction = withWriteTransaction;
exports.createTransaction = createTransaction;
exports.handleTransaction = handleTransaction;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
/**
 * Wraps database operations in a transaction
 * @param callback - Async function containing database operations
 * @param options - Transaction options
 * @returns Result of the callback function
 */
async function withTransaction(callback, options = { readOnly: false }) {
    const transaction = await database_1.sequelize.transaction({
        isolationLevel: options.readOnly
            ? sequelize_1.Transaction.ISOLATION_LEVELS.READ_COMMITTED
            : sequelize_1.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        type: options.readOnly ? sequelize_1.Transaction.TYPES.IMMEDIATE : sequelize_1.Transaction.TYPES.DEFERRED,
    });
    try {
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
}
/**
 * Executes a read-only transaction
 * @param callback - Async function containing read operations
 */
async function withReadTransaction(callback) {
    return withTransaction(callback, { readOnly: true });
}
/**
 * Executes a write transaction with retry logic for deadlocks
 * @param callback - Async function containing write operations
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay between retries in ms (default: 100ms)
 */
async function withWriteTransaction(callback, maxRetries = 3, baseDelay = 100) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await withTransaction(callback, { readOnly: false });
        }
        catch (error) {
            // Check if it's a deadlock or serialization error
            const isRetryable = error.name === 'SequelizeDatabaseError' &&
                (error.original?.code === '40P01' || // deadlock detected
                    error.original?.code === '40001' || // serialization failure
                    error.original?.code === '40P01'); // deadlock_detected
            if (!isRetryable || attempt === maxRetries) {
                throw error;
            }
            // Exponential backoff with jitter
            const jitter = Math.random() * 100; // 0-100ms jitter
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1) + jitter, 10000 // max 10s delay
            );
            await new Promise(resolve => setTimeout(resolve, delay));
            lastError = error;
        }
    }
    throw lastError || new Error('Transaction failed after maximum retries');
}
/**
 * Creates a transaction and passes it to the callback
 * Useful for when you need to use the transaction in multiple places
 */
async function createTransaction(options = { readOnly: false }) {
    return database_1.sequelize.transaction({
        isolationLevel: options.readOnly
            ? sequelize_1.Transaction.ISOLATION_LEVELS.READ_COMMITTED
            : sequelize_1.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
        type: options.readOnly ? sequelize_1.Transaction.TYPES.IMMEDIATE : sequelize_1.Transaction.TYPES.DEFERRED,
    });
}
/**
 * Helper to commit or rollback a transaction based on the operation result
 */
async function handleTransaction(transaction, promise) {
    try {
        const result = await promise;
        await transaction.commit();
        return result;
    }
    catch (error) {
        await transaction.rollback();
        throw error;
    }
}
