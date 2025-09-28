/**
 * Enhanced logging system for the story system
 * Provides structured logging with multiple output formats
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

class Logger {
  constructor() {
    this.createLogsDirectory();
    this.logger = this.createLogger();
  }

  createLogsDirectory() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  createLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let logMessage = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
          logMessage += ` ${JSON.stringify(meta)}`;
        }
        return logMessage;
      })
    );

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports: [
        // File transport for all logs
        new winston.transports.File({
          filename: path.join('logs', 'app.log'),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          tailable: true
        }),

        // Separate file for errors
        new winston.transports.File({
          filename: path.join('logs', 'error.log'),
          level: 'error',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 3
        }),

        // Console transport with custom formatting
        new winston.transports.Console({
          format: consoleFormat,
          level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
        })
      ]
    });
  }

  // Standard log levels
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  // Specialized logging methods for the story system
  storyGeneration(message, data = {}) {
    this.logger.info(`[STORY_GEN] ${message}`, {
      category: 'story_generation',
      ...data
    });
  }

  combat(message, data = {}) {
    this.logger.debug(`[COMBAT] ${message}`, {
      category: 'combat',
      ...data
    });
  }

  userAction(action, data = {}) {
    this.logger.info(`[USER] ${action}`, {
      category: 'user_action',
      ...data
    });
  }

  aiInteraction(message, data = {}) {
    this.logger.info(`[AI] ${message}`, {
      category: 'ai_interaction',
      ...data
    });
  }

  performance(operation, duration, data = {}) {
    this.logger.info(`[PERF] ${operation} completed in ${duration}ms`, {
      category: 'performance',
      operation,
      duration,
      ...data
    });
  }

  quest(message, data = {}) {
    this.logger.debug(`[QUEST] ${message}`, {
      category: 'quest',
      ...data
    });
  }

  // Error tracking with context
  errorWithContext(error, context = {}) {
    this.logger.error(error.message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    });
  }

  // Performance timing helper
  startTimer(operation) {
    const start = Date.now();
    return {
      end: (data = {}) => {
        const duration = Date.now() - start;
        this.performance(operation, duration, data);
        return duration;
      }
    };
  }

  // Log story statistics
  storyStats(stats) {
    this.logger.info('[STATS] Story statistics', {
      category: 'statistics',
      ...stats
    });
  }

  // Log multiplayer events
  multiplayer(event, data = {}) {
    this.logger.info(`[MULTIPLAYER] ${event}`, {
      category: 'multiplayer',
      ...data
    });
  }
}

// Export singleton instance
export default new Logger();