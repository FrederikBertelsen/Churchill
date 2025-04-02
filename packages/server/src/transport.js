'use strict';

const defaultOptions = require('./defaultOptions');

class Transport {
    constructor(options = {}) {
        this.configure(options);
    }

    configure(options = {}) {
        // Store levels reference
        this.levels = options.levels || defaultOptions.levels;

        // Set level - can be string or numeric level
        if (typeof options.level === 'number') {
            // If level is a number, find the corresponding level name
            this.level = Object.keys(this.levels).find(key => this.levels[key] === options.level);
        } else {
            this.level = options.level || defaultOptions.level;
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
            output += ` ${typeof metadata === 'object' ? JSON.stringify(metadata) : metadata}`;
        }

        return output;
    }

    // Helper to check if this transport should handle this log level
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.level];
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