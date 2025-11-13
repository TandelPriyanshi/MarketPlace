import { Transaction } from 'sequelize';
type TransactionCallback<T> = (t: Transaction) => Promise<T>;
/**
 * Wraps database operations in a transaction
 * @param callback - Async function containing database operations
 * @param options - Transaction options
 * @returns Result of the callback function
 */
export declare function withTransaction<T>(callback: TransactionCallback<T>, options?: {
    readOnly?: boolean;
}): Promise<T>;
/**
 * Executes a read-only transaction
 * @param callback - Async function containing read operations
 */
export declare function withReadTransaction<T>(callback: TransactionCallback<T>): Promise<T>;
/**
 * Executes a write transaction with retry logic for deadlocks
 * @param callback - Async function containing write operations
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay between retries in ms (default: 100ms)
 */
export declare function withWriteTransaction<T>(callback: TransactionCallback<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
/**
 * Creates a transaction and passes it to the callback
 * Useful for when you need to use the transaction in multiple places
 */
export declare function createTransaction(options?: {
    readOnly?: boolean;
}): Promise<Transaction>;
/**
 * Helper to commit or rollback a transaction based on the operation result
 */
export declare function handleTransaction<T>(transaction: Transaction, promise: Promise<T>): Promise<T>;
export {};
//# sourceMappingURL=transaction.d.ts.map