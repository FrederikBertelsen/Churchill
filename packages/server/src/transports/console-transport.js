'use strict';

const Transport = require('./transport');

class ConsoleTransport extends Transport {
    constructor(options = {}) {
        super(options);
    }

    log(level, data, metadata) {
        const output = this.logToString(level, data, metadata);

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