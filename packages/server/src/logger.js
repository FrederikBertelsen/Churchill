'use strict';

const defaultOptions = require('./defaultOptions');
const ConsoleTransport = require('./transports/console-transport');

class Logger {
    constructor(options = {}) {
        this.config(options);
        this._setupLogMethods();
    }

    /**
     * Handle errors consistently across the logger
     * @private
     */
    _handleError(error, context = {}) {
        // Format error message with context
        let errorMessage = `Churchill Logger Error: ${error.message}`;
        
        // Add context information if available
        if (Object.keys(context).length > 0) {
            errorMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
        }
        
        // Log the error to console
        console.error(errorMessage);
        
        // If we have error stack and it's not a validation error, log it too
        if (error.stack && !error.message.startsWith('Invalid')) {
            console.error(error.stack.split('\n').slice(1).join('\n'));
        }
        
        return false;
    }

    /**
     * Configure logger settings with provided options
     */
    config(options = {}) {
        try {
            // Validate options
            if (options !== null && typeof options !== 'object') {
                throw new Error(`Invalid options: expected object, got ${typeof options}`);
            }

            // Set log level
            this.level = this._resolveLogLevel(options.level) || defaultOptions.level;
            this.useTimestamp = options.useTimestamp !== undefined ? options.useTimestamp : defaultOptions.useTimestamp;

            // Validate transports if provided
            if (options.transports !== undefined) {
                if (!Array.isArray(options.transports)) {
                    throw new Error(`Invalid transports: expected array, got ${typeof options.transports}`);
                }
                
                // Ensure all transports have a log method
                options.transports.forEach((transport, index) => {
                    if (!transport || typeof transport.log !== 'function') {
                        throw new Error(`Invalid transport at index ${index}: missing log method`);
                    }
                });
            }

            // Set transports
            if (options.transports && options.transports.length > 0) {
                this.transports = options.transports;
                this.transports.forEach(transport => {
                    if (!transport.level) {
                        transport.level = this.level;
                    }
                });
            } else {
                this.transports = [new ConsoleTransport({ level: this.level })];
            }

            return this;
        } catch (err) {
            this._handleError(err, { options });
            // Fall back to default configuration
            this.level = defaultOptions.level;
            this.useTimestamp = defaultOptions.useTimestamp;
            this.transports = [new ConsoleTransport({ level: this.level })];
            return this;
        }
    }

    /**
     * Helper to resolve numeric log levels to string representation
     */
    _resolveLogLevel(level) {
        if (level === undefined) {
            return null;
        }
        
        if (typeof level === 'number') {
            const foundLevel = Object.keys(defaultOptions.levels).find(key =>
                defaultOptions.levels[key] === level);
            
            if (!foundLevel) {
                throw new Error(`Invalid numeric level: ${level} - valid levels are: ${Object.values(defaultOptions.levels).join(', ')}`);
            }
            
            return foundLevel;
        }

        if (level && !defaultOptions.levels[level]) {
            throw new Error(`Unknown level: "${level}" - valid levels are: ${Object.keys(defaultOptions.levels).join(', ')}`);
        }

        return level;
    }

    /**
     * Setup all logging methods
     */
    _setupLogMethods() {
        // Internal log function used by all log levels
        const log = (level, data, metadata = {}, createMetadata = true, forceLog = false) => {
            try {
                if (forceLog || defaultOptions.levels[level] <= defaultOptions.levels[this.level]) {
                    if (createMetadata) {
                        if (this.useTimestamp) {
                            metadata.time = Math.floor(Date.now() / 1000);
                        }
                    }

                    this.transports.forEach(transport => {
                        try {
                            if (forceLog || transport.shouldLog(level)) {
                                transport.log(level, data, metadata);
                            }
                        } catch (err) {
                            this._handleError(err, { 
                                transport: transport.constructor.name, 
                                level, 
                                data, 
                                metadata 
                            });
                        }
                    });
                }
                return true;
            } catch (err) {
                return this._handleError(err, { level, data, metadata });
            }
        };

        // Define all public logging methods explicitly
        this.trace = (data) => {
            try {
                const error = new Error();
                Error.captureStackTrace(error, this.trace);
                const tracestack = error.stack.split('\n').slice(1).join('\n');
                return log('trace', data, { trace: tracestack });
            } catch (err) {
                return this._handleError(err, { level: 'trace', data });
            }
        };
        this.debug = (data) => log('debug', data, {});
        this.info = (data) => log('info', data, {});
        this.warn = (data) => log('warn', data, {});
        this.error = (data) => log('error', data, {});

        // Process log implementation
        this.processLog = (payload) => {
            try {
                if (typeof payload === 'string') {
                    try {
                        payload = JSON.parse(payload);
                    } catch (parseErr) {
                        throw new Error(`Invalid JSON payload: ${parseErr.message}`);
                    }
                } else if (Array.isArray(payload)) {
                    // Process array of logs
                    let success = true;
                    payload.forEach(item => {
                        if (!this.processLog(item)) {
                            success = false;
                        }
                    });
                    return success;
                } else if (typeof payload !== 'object' || payload === null) {
                    throw new Error(`Invalid payload format: expected object or JSON string, got ${payload === null ? 'null' : typeof payload}`);
                }

                const level = payload.level || 'info';
                
                // Validate level
                if (!defaultOptions.levels[level]) {
                    throw new Error(`Invalid log level in payload: "${level}" - valid levels are: ${Object.keys(defaultOptions.levels).join(', ')}`);
                }
                
                const data = payload.data || '';
                const metadata = payload.metadata || {};

                log(level, data, metadata, false, true);
                return true;
            } catch (err) {
                return this._handleError(err, { payload });
            }
        };
    }
}

module.exports = Logger;