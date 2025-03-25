'use strict';

const defaultOptions = require('./defaultOptions');
const ConsoleTransport = require('./console-transport');

class Logger {
    constructor(options = {}) {
        this.configure(options);
    }

    log(level, message, metadata = {}, force = false) {
        if (force || this.levels[level] <= this.levels[this.level]) {
            // Send the log to all transports
            this.transports.forEach(transport => {
                transport.log(level, message, metadata);
            });
        }
    }

    configure(options = {}) {
        // First remove previously dynamically created level methods
        if (this.levels) {
            Object.keys(this.levels).forEach(level => {
                delete this[level];
            });
        }

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

        // Configure transports
        this.transports = [];
        
        if (options.transports && Array.isArray(options.transports) && options.transports.length > 0) {
            // Add user-specified transports
            this.transports = options.transports;
            
            // Ensure transports have the same levels definition as the logger
            this.transports.forEach(transport => {
                transport.configure({ levels: this.levels });
            });
        } else {
            // Add default console transport if none specified
            this.transports.push(new ConsoleTransport({
                level: this.level,
                levels: this.levels
            }));
        }

        // Dynamically create logging methods for each level
        // (e.g. logger.info('message'), logger.warn('message'), etc.)
        Object.keys(this.levels).forEach(level => {
            this[level] = (message, metadata) => {
                this.log(level, message, metadata);
            };
        });
        
        return this;
    }

    processLog(payload) {
        try {
            if (typeof payload === 'string') {
                payload = JSON.parse(payload);
            }

            const level = payload.level || 'info';
            const message = payload.message || payload.data || '';
            const metadata = payload.metadata || {};

            this.log(level, message, metadata, true);
            return true;
        } catch (err) {
            console.error(`Error processing log: ${err.message}`);
            return false;
        }
    }
}

module.exports = Logger;