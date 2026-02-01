/**
 * Log levels in order of severity.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Get the current log level based on environment.
 * In production, only warn and error are logged.
 * In development, all levels are logged.
 */
function getCurrentLevel(): LogLevel {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return 'warn';
  }
  return 'debug';
}

/**
 * Check if a message at the given level should be logged.
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getCurrentLevel()];
}

/**
 * Format a log message with timestamp and level.
 */
function formatMessage(level: LogLevel, args: unknown[]): unknown[] {
  const timestamp = new Date().toISOString();
  return [`[${timestamp}] [${level.toUpperCase()}]`, ...args];
}

/**
 * Logger utility that respects environment settings.
 * - In development: logs all levels
 * - In production: only logs warn and error
 *
 * Usage:
 *   logger.debug('Debug message', { data });
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message', error);
 */
export const logger = {
  /**
   * Log debug messages (development only).
   */
  debug: (...args: unknown[]): void => {
    if (shouldLog('debug')) {
      console.debug(...formatMessage('debug', args));
    }
  },

  /**
   * Log info messages (development only).
   */
  info: (...args: unknown[]): void => {
    if (shouldLog('info')) {
      console.info(...formatMessage('info', args));
    }
  },

  /**
   * Log warning messages (always logged).
   */
  warn: (...args: unknown[]): void => {
    if (shouldLog('warn')) {
      console.warn(...formatMessage('warn', args));
    }
  },

  /**
   * Log error messages (always logged).
   */
  error: (...args: unknown[]): void => {
    if (shouldLog('error')) {
      console.error(...formatMessage('error', args));
    }
  }
};

export default logger;
