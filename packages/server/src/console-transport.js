'use strict';

const Transport = require('./transport');

class ConsoleTransport extends Transport {
    constructor(options = {}) {
        super(options);
        
        this.configure(options);
    }
    
    configure(options = {}) {                
        return this;
    }
    
    log(level, message, metadata) {
        const output = this.formatOutput(level, message, metadata);
        
        // Use appropriate console method based on level
        if (level === 'error') {
            console.error(output);
        } else if (level === 'warn') {
            console.warn(output);
        } else {
            console.log(output);
        }
    }
    
    // Helper to check if this transport should handle this log level
    shouldLog(level) {
        return this.enabled && 
               this.levels[level] <= this.levels[this.level];
    }
}

module.exports = ConsoleTransport;