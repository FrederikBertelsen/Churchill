'use strict';

const defaultOptions = require('../defaultOptions');

class Transport {
    constructor(options = {}) {
        this.config(options);
    }

    config(options = {}) {
        // Set level - can be string or numeric level
        if (typeof options.level === 'number') {
            // If level is a number, find the corresponding level name
            const level = Object.keys(defaultOptions.levels).find(key => defaultOptions.levels[key] === options.level);
            if (!level) {
                throw new Error(`Invalid numeric log level: ${options.level} - valid levels are: ${Object.values(defaultOptions.levels).join(', ')}`);
            }
            this.level = level;
        } else if (options.level) {
            // Validate string level
            if (!defaultOptions.levels[options.level]) {
                throw new Error(`Unknown log level: "${options.level}" - valid levels are: ${Object.keys(defaultOptions.levels).join(', ')}`);
            }
            this.level = options.level;
        } else {
            this.level = options.level; // this will be overridden by the logger's level if null
        }

        // Store any other custom options passed to the transport
        this.options = { ...options };

        return this;
    }

    log(level, data, metadata) {
        // Abstract method to be implemented by specific transports
        throw new Error('Transport must implement log method - this is an abstract base class');
    }

    // Helper to check if this transport should handle this log level
    shouldLog(level) {
        // Validate input level
        if (!defaultOptions.levels[level]) {
            throw new Error(`Invalid log level: "${level}" - valid levels are: ${Object.keys(defaultOptions.levels).join(', ')}`);
        }
        
        return defaultOptions.levels[level] <= defaultOptions.levels[this.level];
    }

    // Static method to create simple transport with a custom log function
    static create(customLogFunction, options = {}) {
        // Ensure customImplementation is a function
        if (typeof customLogFunction !== 'function') {
            throw new Error('Custom transport function must be a function - received: ' + typeof customLogFunction);
        }

        // Create a new Transport instance
        const transport = new Transport(options);

        // Override the log method with custom implementation
        transport.log = customLogFunction;

        return transport;
    }
}

module.exports = Transport;