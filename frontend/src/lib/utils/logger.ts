export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

class Logger {
  private level: LogLevel;
  private rateLimiter = new Map<string, { count: number; timestamp: number }>();

  constructor() {
    // Set default log level based on environment
    this.level =
      process.env.NODE_ENV === "production"
        ? LogLevel.ERROR
        : process.env.LOG_LEVEL
          ? parseInt(process.env.LOG_LEVEL)
          : LogLevel.VERBOSE;
  }

  private getCallerInfo(): string {
    const error = new Error();
    const stack = error.stack?.split("\n")[3];
    const match = stack?.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
    if (match) {
      const [, , file, line] = match;
      return `${file}:${line}`;
    }
    return "";
  }

  private getPackageInfo(stack: string): string {
    const nodeModulesMatch = stack?.match(/node_modules\/([@\w-]+\/)*(\w+)/);
    return nodeModulesMatch ? nodeModulesMatch[0] : "app";
  }

  private shouldThrottle(message: string): boolean {
    const now = Date.now();
    const key = message.substring(0, 100); // Use message prefix as key
    const limit = this.rateLimiter.get(key);

    if (!limit || now - limit.timestamp > 60000) {
      // Reset after 1 minute
      this.rateLimiter.set(key, { count: 1, timestamp: now });
      return false;
    }

    if (limit.count >= 100) {
      // Max 100 similar messages per minute
      return true;
    }

    limit.count++;
    return false;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private formatMessage(
    level: string,
    message: string,
    ...args: unknown[]
  ): string {
    const logObject = {
      timestamp: new Date().toISOString(),
      level: level,
      source: {
        package: this.getPackageInfo(new Error().stack || ""),
        location: this.getCallerInfo(),
      },
      message: message,
      data: args.length > 0 ? this.formatArgs(args) : undefined,
    };

    // Remove undefined fields to keep JSON clean
    Object.keys(logObject).forEach((key) => {
      const typedKey = key as keyof typeof logObject;
      if (logObject[typedKey] === undefined) {
        delete logObject[typedKey];
      }
    });

    return JSON.stringify(logObject, null, 2);
  }

  private formatArgs(args: unknown[]): unknown {
    if (args.length === 1) {
      const arg = args[0];
      if (arg instanceof Error) {
        return {
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
        };
      }
      return arg;
    }
    return args;
  }

  error(message: string, ...args: unknown[]) {
    if (this.shouldLog(LogLevel.ERROR) && !this.shouldThrottle(message)) {
      console.error(this.formatMessage("ERROR", message, ...args));
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.shouldLog(LogLevel.WARN) && !this.shouldThrottle(message)) {
      console.warn(this.formatMessage("WARN", message, ...args));
    }
  }

  info(message: string, ...args: unknown[]) {
    if (this.shouldLog(LogLevel.INFO) && !this.shouldThrottle(message)) {
      console.info(this.formatMessage("INFO", message, ...args));
    }
  }

  debug(message: string, ...args: unknown[]) {
    if (this.shouldLog(LogLevel.DEBUG) && !this.shouldThrottle(message)) {
      console.debug(this.formatMessage("DEBUG", message, ...args));
    }
  }

  verbose(message: string, ...args: unknown[]) {
    if (this.shouldLog(LogLevel.VERBOSE) && !this.shouldThrottle(message)) {
      console.log(this.formatMessage("VERBOSE", message, ...args));
    }
  }
}

// Export a singleton instance
export const logger = new Logger();

class ConsoleInterceptor {
  private originalConsole: { [key: string]: Console[keyof Console] } = {};

  interceptConsole() {
    // Store original console methods
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    // Override console methods
    console.log = (...args) => this.handleLog("log", ...args);
    console.info = (...args) => this.handleLog("info", ...args);
    console.warn = (...args) => this.handleLog("warn", ...args);
    console.error = (...args) => this.handleLog("error", ...args);
    console.debug = (...args) => this.handleLog("debug", ...args);
  }

  private handleLog(type: string, ...args: unknown[]) {
    // Forward to our logger
    switch (type) {
      case "error":
        logger.error(this.formatArgs(args));
        break;
      case "warn":
        logger.warn(this.formatArgs(args));
        break;
      case "info":
        logger.info(this.formatArgs(args));
        break;
      case "debug":
        logger.debug(this.formatArgs(args));
        break;
      default:
        logger.verbose(this.formatArgs(args));
    }
  }

  private formatArgs(args: unknown[]): string {
    return args
      .map((arg) => {
        if (arg instanceof Error) {
          return `${arg.message}\n${arg.stack}`;
        }
        if (typeof arg === "object") {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      })
      .join(" ");
  }

  // For global error handling
  interceptGlobalErrors() {
    if (typeof window !== "undefined") {
      // Browser-side error handling
      window.onerror = (message, source, lineno, colno, error) => {
        logger.error("Global error:", {
          message,
          source,
          lineno,
          colno,
          error: error?.stack || error,
        });
        return false;
      };

      window.addEventListener("unhandledrejection", (event) => {
        logger.error("Unhandled Promise rejection:", {
          reason: event.reason,
          stack: event.reason?.stack,
        });
      });
    } else {
      // Server-side error handling
      process.on("uncaughtException", (error) => {
        logger.error("Uncaught Exception:", error);
        // Gracefully shutdown if needed
        process.exit(1);
      });

      process.on("unhandledRejection", (reason) => {
        logger.error("Unhandled Rejection:", reason);
      });
    }
  }
}

export const interceptor = new ConsoleInterceptor();
