'use strict';

const defaultOptions = require('./defaultOptions');

class Logger {
    constructor(options = {}) {
        this.configure(options);
    }

    log(level, message, force = false) {
        if (force || this.levels[level] <= this.levels[this.level]) {
            console.log(`[${level}] ${message}`);
        }
    }

    configure({ levels, level }) {
        // First remove previously dynamically created level methods
        if (this.levels) {
            Object.keys(this.levels).forEach(level => {
                delete this[level];
            });
        }

        this.levels = levels || defaultOptions.levels;

        // If level is a number, find the corresponding level name
        if (typeof level === 'number') {
            level = Object.keys(this.levels).find(key => this.levels[key] === level);
        }

        // Validate level
        if (level && !this.levels[level]) {
            throw new Error(`Unknown level: ${level} - valid levels are: ${Object.keys(this.levels).join(', ')}`);
        }
        this.level = level || defaultOptions.level;

        // Dynamically create logging methods for each level
        // (e.g. logger.info('message'), logger.warn('message'), etc.)
        Object.keys(this.levels).forEach(level => {
            this[level] = (message) => {
                this.log(level, message);
            };
        });
    }

    processLog(payload) {
        try {
            if (typeof payload === 'string') {
                payload = JSON.parse(payload);
            }

            this.log(
                payload.level,
                payload.message || payload.data || JSON.stringify(payload),
                true
            );
            // this[payload.level](payload.message || payload.data || JSON.stringify(payload));


            // if (payload.level && typeof payload.level === 'string') {
            //     if (typeof this[payload.level] === 'function') {
            //         this[payload.level](payload.message || payload.data || JSON.stringify(payload));
            //     } else {
            //         console.error(`Unknown level: ${payload.level}`);
            //         return false;
            //     }
            // } else {
            //     this.info(payload.message || payload.data || JSON.stringify(payload));
            // }

            return true;
        } catch (err) {
            console.error(`Error processing log: ${err.message}`);
            return false;
        }
    }
}

module.exports = Logger;