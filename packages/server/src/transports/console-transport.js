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
        
        // Create deep copies to avoid modifying original objects
        const metadataCopy = metadata ? JSON.parse(JSON.stringify(metadata)) : null;
        
        if (metadataCopy && metadataCopy.time) {
            const timestamp = String(metadataCopy.time).length >= 13
                ? metadataCopy.time
                : metadataCopy.time * 1000;
            delete metadataCopy.time;
            output += `${new Date(timestamp).toISOString()} `;
        }

        // Add level
        output += `[${level.toUpperCase()}] `;

        // Add data
        if (data && typeof data === 'string') {
            output += `"${data}" `;
        } else if (data && typeof data === 'object') {
            // Create deep copy of data
            const processedData = JSON.parse(JSON.stringify(data));
            if (data.message && Object.keys(data).length === 1) {
                output += `${data.message} `;
            } else {
                let jsonString = JSON.stringify(processedData, null, 2);
                // Apply newline replacement here
                jsonString = this.replaceNewlines(jsonString);
                output += `${jsonString} `;
            }
        }

        // Create a formatted display string for metadata
        if (metadataCopy && Object.keys(metadataCopy).length > 0) {
            if (metadataCopy.trace) {
                metadataCopy.trace = '\n' + metadataCopy.trace;
            }

            let jsonString = JSON.stringify(metadataCopy, null, 2);
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