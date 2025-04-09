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
        } else if (data && typeof data === 'object') {
            if (data.message && Object.keys(data).length === 1) {
                output += `${data.message} `;
            } else {
                output += `${JSON.stringify(data)} `;
            }
        }

        // Create a formatted display string for metadata
        if (metadata) {
            // Create a copy of metadata for display formatting
            const displayMetadata = { ...metadata };

            // Format timestamp for display only (not modifying original)
            if (displayMetadata.time) {
                const timestamp = String(displayMetadata.time).length >= 13
                    ? displayMetadata.time
                    : displayMetadata.time * 1000;
                displayMetadata.time = new Date(timestamp).toLocaleString();
            }

            output += `${JSON.stringify(displayMetadata)} `;
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