import { Transaction } from 'sequelize';
import { sequelize } from '../config/database';

type TransactionCallback<T> = (t: Transaction) => Promise<T>;

/**
 * Wraps database operations in a transaction
 * @param callback - Async function containing database operations
 * @param options - Transaction options
 * @returns Result of the callback function
 */
export async function withTransaction<T>(
  callback: TransactionCallback<T>,
  options: { readOnly?: boolean } = { readOnly: false }
): Promise<T> {
  const transaction = await sequelize.transaction({
    isolationLevel: options.readOnly 
      ? Transaction.ISOLATION_LEVELS.READ_COMMITTED 
      : Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    type: options.readOnly ? Transaction.TYPES.IMMEDIATE : Transaction.TYPES.DEFERRED,
  });

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Executes a read-only transaction
 * @param callback - Async function containing read operations
 */
export async function withReadTransaction<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  return withTransaction(callback, { readOnly: true });
}

/**
 * Executes a write transaction with retry logic for deadlocks
 * @param callback - Async function containing write operations
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay between retries in ms (default: 100ms)
 */
export async function withWriteTransaction<T>(
  callback: TransactionCallback<T>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback, { readOnly: false });
    } catch (error: any) {
      // Check if it's a deadlock or serialization error
      const isRetryable = 
        error.name === 'SequelizeDatabaseError' && 
        (error.original?.code === '40P01' || // deadlock detected
         error.original?.code === '40001' || // serialization failure
         error.original?.code === '40P01');  // deadlock_detected
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const jitter = Math.random() * 100; // 0-100ms jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + jitter,
        10000 // max 10s delay
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
export async function createTransaction(
  options: { readOnly?: boolean } = { readOnly: false }
): Promise<Transaction> {
  return sequelize.transaction({
    isolationLevel: options.readOnly 
      ? Transaction.ISOLATION_LEVELS.READ_COMMITTED 
      : Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
    type: options.readOnly ? Transaction.TYPES.IMMEDIATE : Transaction.TYPES.DEFERRED,
  });
}

/**
 * Helper to commit or rollback a transaction based on the operation result
 */
export async function handleTransaction<T>(
  transaction: Transaction,
  promise: Promise<T>
): Promise<T> {
  try {
    const result = await promise;
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
