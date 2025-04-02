'use strict';

const defaultOptions = require('./defaultOptions');

class Logger {
    constructor(options = {}) {
        this.configure(options);

        // Private log function (not accessible outside this constructor)
        const log = (level, message, metadata = {}) => {
            if (this.levels[level] <= this.levels[this.level]) {
                // Send the log to all transports
                this.transports.forEach(transport => {
                    if (transport.shouldLog(level)) {
                        transport.log(level, message, metadata);
                    }
                });
            }
        };

        // Define all public logging methods to use the private log function
        this.trace = (message, metadata) => log('trace', message, metadata);
        this.debug = (message, metadata) => log('debug', message, metadata);
        this.info = (message, metadata) => log('info', message, metadata);
        this.warn = (message, metadata) => log('warn', message, metadata);
        this.error = (message, metadata) => log('error', message, metadata);
        this.fatal = (message, metadata) => log('fatal', message, metadata);
        
        // Process log implementation that uses the private log function
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

                log(level, message, metadata);
                
                return true;
            } catch (err) {
                console.error(`Error processing log: ${err.message}`);
                return false;
            }
        };
    }

    configure(options = {}) {
        this.levels = options.levels || defaultOptions.levels;

        // If level is a number, find the corresponding level name
        if (typeof options.level === 'number') {
            options.level = Object.keys(this.levels).find(key => this.levels[key] === options.level);
        }
        // Validate level
        if (options.level && !this.levels[options.level]) {
            throw new Error(`Unknown level: ${options.level} - valid levels are: ${Object.keys(this.levels).join(', ')}`);
        }
        this.level = options.level || defaultOptions.level;

        if (options.transports && Array.isArray(options.transports) && options.transports.length > 0) {
            // Add user-specified transports
            this.transports = options.transports;
        } else {
            // Add default console transport if none specified
            this.transports = defaultOptions.transports;
        }

        return this;
    }
}

module.exports = Logger;