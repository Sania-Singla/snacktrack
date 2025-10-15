import { ErrorHandler } from './errorHandler.js';

/**
 * try catch wrapper
 * @param {string} aim - description of the operation to perform
 * @param {function} fn - actual function to execute
 * @returns function wrapped in try catch
 */
export function tryCatch(aim, fn) {
    return async function (req, res, next) {
        try {
            await fn(req, res, next);
        } catch (err) {
            console.error(`[ERROR] in ${aim}: `, err);
            next(new ErrorHandler(err.message));
        }
    };
}

/**
 * try catch wrapper for socket events
 * @param {function} fn - actual function to execute
 * @returns function wrapped in try catch
 */
export function safeHandler(fn) {
    return async function (...args) {
        try {
            await fn(...args);
        } catch (err) {
            console.error('[SOCKET ERROR] ', err);
        }
    };
}
