'use strict';

const os = require('os');
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

        // Enable/disable the transport
        this.enabled = options.enabled !== false;

        // Store any other custom options passed to the transport
        this.options = { ...options };

        return this;
    }

    log(level, message, metadata) {
        // Abstract method to be implemented by specific transports
        throw new Error('Transport must implement log method');
    }

    // Helper to check if this transport should handle this log level
    shouldLog(level) {
        return this.enabled &&
            this.levels[level] <= this.levels[this.level];
    }
    
    // Static method to create custom transport
    static create(customImplementation, options = {}) {
        // Handle both function and object with log method
        const logFunction = typeof customImplementation === 'function' 
            ? customImplementation 
            : (customImplementation && typeof customImplementation.log === 'function' 
                ? customImplementation.log.bind(customImplementation) 
                : null);
                
        if (!logFunction) {
            throw new Error('Custom transport must be a function or an object with a log method');
        }
        
        // Merge options if customImplementation is an object with options
        if (typeof customImplementation === 'object' && customImplementation !== null) {
            options = { ...customImplementation, ...options };
            // Remove log function from options if present
            delete options.log;
        }
        
        // Create a new Transport instance
        const transport = new Transport(options);
        
        // Override the log method to call the custom implementation
        transport.log = function(level, message, metadata) {
            // First check if this transport should log this level
            if (!this.shouldLog(level)) return;
            
            // Call the custom log function
            return logFunction(level, message, metadata, this);
        };
        
        return transport;
    }
}

module.exports = Transport;