'use strict';

const Transport = require('./transport');

class ConsoleTransport extends Transport {
    constructor(options = {}) {
        super(options);
        
        this.configure(options);
    }
    
    configure(options = {}) {
        super.configure(options);
        
        this.timestamp = options.timestamp !== false;
        
        return this;
    }
    
    log(level, message, metadata) {
        if (!this.shouldLog(level)) return;
        
        const output = this._formatOutput(level, message, metadata);
        
        // Use appropriate console method based on level
        if (level === 'error' || level === 'fatal') {
            console.error(output);
        } else if (level === 'warn') {
            console.warn(output);
        } else {
            console.log(output);
        }
    }
    
    _formatOutput(level, message, metadata) {
        let output = '';
        
        // Add timestamp if enabled
        if (this.timestamp) {
            output += `[${new Date().toISOString()}] `;
        }
        
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
        return this.enabled && 
               this.levels[level] <= this.levels[this.level];
    }
}

module.exports = ConsoleTransport;