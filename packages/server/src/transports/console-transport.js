'use strict';

const Transport = require('./transport');

class ConsoleTransport extends Transport {
    constructor(options = {}) {
        super(options);
    }

    replaceNewlines(str) {
        // Convert JSON-escaped newlines back to actual newline characters
        if (typeof str === 'string') {
            return str.replace(/\\n/g, '\n');
        }
        return str;
    }

    logToString(level, data, metadata) {
        let output = '';

        if (metadata && metadata.time) {
            const timestamp = String(metadata.time).length >= 13
                ? metadata.time
                : metadata.time * 1000;
            delete metadata.time;
            output += `${new Date(timestamp).toISOString()} `;
        }

        // Add level
        output += `[${level.toUpperCase()}] `;

        // Add data
        if (data && typeof data === 'string') {
            output += `"${data}" `;
        } else if (data && typeof data === 'object') {
            if (data.message && Object.keys(data).length === 1) {
                output += `${data.message} `;
            } else {
                const processedData = JSON.parse(JSON.stringify(data)); // Clone to avoid modifying original
                let jsonString = JSON.stringify(processedData, null, 2);
                // Apply newline replacement here
                jsonString = this.replaceNewlines(jsonString);
                output += `${jsonString} `;
            }
        }

        // Create a formatted display string for metadata
        if (metadata && Object.keys(metadata).length > 0) {
            if (metadata.trace) {
                metadata.trace = '\n' + metadata.trace;
            }

            const processedMetadata = JSON.parse(JSON.stringify(metadata));
            let jsonString = JSON.stringify(processedMetadata, null, 2);
            // Apply newline replacement here too
            jsonString = this.replaceNewlines(jsonString);
            output += `${jsonString} `;
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