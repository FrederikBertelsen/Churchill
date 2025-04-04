'use strict';

const defaultOptions = require('./defaultOptions');
const ConsoleTransport = require('./transports/console-transport');

class Logger {
    constructor(options = {}) {
        this.config(options);
        this._setupLogMethods();
    }

    /**
     * Configure logger settings with provided options
     */
    config(options = {}) {
        // Set log level
        this.level = this._resolveLogLevel(options.level) || defaultOptions.level;
        this.useTimestamp = options.useTimestamp || defaultOptions.useTimestamp;

        // Set transports
        if (options.transports && Array.isArray(options.transports) && options.transports.length > 0) {
            this.transports = options.transports;
        } else {
            this.transports = [new ConsoleTransport({ level: this.level })];
        }


        return this;
    }

    /**
     * Helper to resolve numeric log levels to string representation
     */
    _resolveLogLevel(level) {
        if (typeof level === 'number') {
            return Object.keys(defaultOptions.levels).find(key =>
                defaultOptions.levels[key] === level);
        }

        if (level && !defaultOptions.levels[level]) {
            throw new Error(`Unknown level: ${level} - valid levels are: ${Object.keys(defaultOptions.levels).join(', ')}`);
        }

        return level;
    }

    /**
     * Setup all logging methods
     */
    _setupLogMethods() {
        // Internal log function used by all log levels
        const log = (level, message, metadata = {}, createMetadata = true) => {
            if (defaultOptions.levels[level] <= defaultOptions.levels[this.level]) {

                if (createMetadata) {
                    if (this.useTimestamp) {
                        metadata.timestamp = Math.floor(Date.now() / 1000);
                    }
                }

                this.transports.forEach(transport => {
                    if (transport.shouldLog(level)) {
                        transport.log(level, message, metadata);
                    }
                });
            }
        };

        // Define all public logging methods explicitly
        this.trace = (message) => log('trace', message, { trace: new Error().stack });
        this.debug = (message) => log('debug', message, {});
        this.info = (message) => log('info', message, {});
        this.warn = (message) => log('warn', message, {});
        this.error = (message) => log('error', message, {});

        // Process log implementation
        this.processLog = (payload) => {
            try {
                if (typeof payload === 'string') {
                    payload = JSON.parse(payload);
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
                    console.error('Invalid payload format');
                    return false;
                }

                const level = payload.level || 'info';
                const message = payload.message || payload.data || '';
                const metadata = payload.metadata || {};

                log(level, message, metadata, false);
                return true;
            } catch (err) {
                console.error(`Error processing log: ${err.message}`);
                return false;
            }
        };
    }
}

module.exports = Logger;