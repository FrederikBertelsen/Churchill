'use strict';

const Transport = require('./transport');

class ConsoleTransport extends Transport {
    constructor(options = {}) {
        super(options);
    }

    log(level, message, metadata) {
        const output = this.logToString(level, message, metadata);

        // Use appropriate console method based on level
        if (level === 'error') {
            console.error(output);
        } else if (level === 'warn') {
            console.warn(output);
        } else {
            console.log(output);
        }
    }
}

module.exports = ConsoleTransport;