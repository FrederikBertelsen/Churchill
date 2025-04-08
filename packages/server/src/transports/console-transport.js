'use strict';

const Transport = require('./transport');

class ConsoleTransport extends Transport {
    constructor(options = {}) {
        super(options);
    }

    logToString(level, data, metadata) {
        let output = '';

        // Add level
        output += `${level.toUpperCase()}: `;

        // Add data
        if (data && typeof data === 'string') {
            output += `"${data}" `;
            // if data is an object, and the only key is 'message', use that
        } else if (data && typeof data === 'object') {
            if (data.message && Object.keys(data).length === 1) {
                output += `${data.message} `;
            } else {
                output += `${JSON.stringify(data)} `;
            }
        }

        // Add timestamp if available
        if (metadata && typeof data === 'string') {
            output += `${data} `;
        } else if (metadata && typeof data === 'object') {
            // Add timestamp if available
            if (metadata.time) {
                // Check if timestamp is already in milliseconds (13 digits) or needs conversion from seconds
                const timestamp = metadata.time.toString().length >= 13 ? metadata.time : metadata.time * 1000;
                const date = new Date(timestamp);
                metadata.time = date.toLocaleString();
            }

            output += `${JSON.stringify(metadata)} `;
        }

        return output;
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