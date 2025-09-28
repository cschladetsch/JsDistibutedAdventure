/**
 * Centralized error handling system
 * Provides consistent error handling across the application
 */

import Logger from './Logger.js';

export class StoryError extends Error {
  constructor(message, code = 'STORY_ERROR', context = {}) {
    super(message);
    this.name = 'StoryError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

export class CombatError extends StoryError {
  constructor(message, context = {}) {
    super(message, 'COMBAT_ERROR', context);
    this.name = 'CombatError';
  }
}

export class AIError extends StoryError {
  constructor(message, context = {}) {
    super(message, 'AI_ERROR', context);
    this.name = 'AIError';
  }
}

export class ConfigError extends StoryError {
  constructor(message, context = {}) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigError';
  }
}

export class ValidationError extends StoryError {
  constructor(message, context = {}) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

class ErrorHandler {
  constructor() {
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      Logger.errorWithContext(error, { type: 'uncaughtException' });
      console.error('💥 Uncaught Exception:', error.message);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      Logger.errorWithContext(new Error(`Unhandled Rejection: ${reason}`), {
        type: 'unhandledRejection',
        promise: promise.toString()
      });
      console.error('🚫 Unhandled Promise Rejection:', reason);
    });
  }

  // Handle story generation errors
  handleStoryError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      code: error.code || 'UNKNOWN',
      context,
      timestamp: new Date().toISOString()
    };

    Logger.errorWithContext(error, errorInfo);

    // Return user-friendly error message
    if (error instanceof AIError) {
      return 'AI service temporarily unavailable. Using fallback story generation.';
    } else if (error instanceof CombatError) {
      return 'Combat system error. Returning to story.';
    } else if (error instanceof ValidationError) {
      return 'Invalid input. Please try again.';
    } else {
      return 'An unexpected error occurred. The adventure continues...';
    }
  }

  // Handle API errors with retry logic
  async handleApiError(error, operation, maxRetries = 3) {
    Logger.errorWithContext(error, {
      operation,
      attempt: 1,
      maxRetries
    });

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new AIError('Network connection failed', { originalError: error });
    }

    if (error.response?.status === 429) {
      throw new AIError('Rate limit exceeded', {
        retryAfter: error.response.headers['retry-after']
      });
    }

    if (error.response?.status === 401) {
      throw new AIError('Authentication failed', {
        service: operation
      });
    }

    throw new AIError(`API operation failed: ${operation}`, {
      originalError: error
    });
  }

  // Validate input with detailed error messages
  validateInput(input, rules) {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = input[field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rule.type && typeof value !== rule.type) {
          errors.push(`${field} must be a ${rule.type}`);
        }

        if (rule.min && value < rule.min) {
          errors.push(`${field} must be at least ${rule.min}`);
        }

        if (rule.max && value > rule.max) {
          errors.push(`${field} must be at most ${rule.max}`);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${field} has invalid format`);
        }

        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`, { errors });
    }

    return true;
  }

  // Graceful degradation for features
  async withFallback(primaryFn, fallbackFn, context = {}) {
    try {
      return await primaryFn();
    } catch (error) {
      Logger.warn(`Primary operation failed, using fallback: ${error.message}`, context);
      return await fallbackFn();
    }
  }

  // Retry mechanism with exponential backoff
  async retry(operation, maxAttempts = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          break;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        Logger.warn(`Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms`, {
          error: error.message,
          attempt,
          maxAttempts
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Safe execution wrapper
  async safeExecute(fn, errorMessage = 'Operation failed', context = {}) {
    try {
      return await fn();
    } catch (error) {
      const handledMessage = this.handleStoryError(error, context);
      console.error(`❌ ${errorMessage}: ${handledMessage}`);
      return null;
    }
  }

  // Create error from HTTP response
  createHttpError(response, context = {}) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.response = response;

    return new AIError(error.message, {
      status: response.status,
      url: response.url,
      ...context
    });
  }

  // Format error for user display
  formatUserError(error) {
    if (error instanceof StoryError) {
      return {
        message: error.message,
        code: error.code,
        type: 'story',
        recoverable: true
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      type: 'system',
      recoverable: false
    };
  }
}

// Export singleton instance and error classes
export default new ErrorHandler();
export { ErrorHandler };