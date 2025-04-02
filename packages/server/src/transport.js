'use strict';

const defaultOptions = require('./defaultOptions');

class Transport {
    constructor(options = {}) {
        this.config(options);
    }

    config(options = {}) {
        // Set level - can be string or numeric level
        if (typeof options.level === 'number') {
            // If level is a number, find the corresponding level name
            this.level = Object.keys(defaultOptions.levels).find(key => defaultOptions.levels[key] === options.level);
        } else {
            this.level = options.level || defaultOptions.level;
        }

        // Validate that the level exists in our levels object
        if (!defaultOptions.levels[this.level]) {
            this.level = defaultOptions.level; // Fallback to default if level is invalid
        }

        // Store any other custom options passed to the transport
        this.options = { ...options };

        return this;
    }

    log(level, message, metadata) {
        // Abstract method to be implemented by specific transports
        throw new Error('Transport must implement log method');
    }

    logToString(level, message, metadata) {
        let output = '';

        // Add level
        output += `[${level.toUpperCase()}] `;

        // Add message
        output += typeof message === 'object' ? JSON.stringify(message) : message;

        // Add metadata if available
        if (metadata) {
            output += ` ${typeof metadata === 'object' ? Object.keys(metadata).length === 0 ? '' : JSON.stringify(metadata) : metadata}`;
        }

        return output;
    }

    // Helper to check if this transport should handle this log level
    shouldLog(level) {
        return defaultOptions.levels[level] <= defaultOptions.levels[this.level];
    }

    // Static method to create simple transport with a custom log function
    static create(customLogFunction, options = {}) {
        // Ensure customImplementation is a function
        if (typeof customLogFunction !== 'function') {
            throw new Error('Custom transport function must be a function');
        }

        // Create a new Transport instance
        const transport = new Transport(options);

        // Override the log method with custom implementation
        transport.log = customLogFunction;

        return transport;
    }
}

module.exports = Transport;