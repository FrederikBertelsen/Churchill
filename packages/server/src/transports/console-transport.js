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
        try {
            let output = '';
            
            // Create deep copies to avoid modifying original objects
            let metadataCopy;
            try {
                metadataCopy = metadata ? JSON.parse(JSON.stringify(metadata)) : null;
            } catch (err) {
                console.error(`Error processing metadata: ${err.message}`);
                metadataCopy = { error: 'Failed to process metadata object' };
            }
            
            if (metadataCopy && metadataCopy.time) {
                try {
                    const timestamp = String(metadataCopy.time).length >= 13
                        ? metadataCopy.time
                        : metadataCopy.time * 1000;
                    delete metadataCopy.time;
                    output += `${new Date(timestamp).toISOString()} `;
                } catch (err) {
                    output += `[Invalid Timestamp] `;
                }
            }

            // Add level
            output += `[${level.toUpperCase()}] `;

            // Add data
            if (data && typeof data === 'string') {
                output += `"${data}" `;
            } else if (data && typeof data === 'object') {
                try {
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
                } catch (err) {
                    output += `[Complex Object: ${err.message}] `;
                }
            }

            // Create a formatted display string for metadata
            if (metadataCopy && Object.keys(metadataCopy).length > 0) {
                if (metadataCopy.trace) {
                    metadataCopy.trace = '\n' + metadataCopy.trace;
                }

                try {
                    let jsonString = JSON.stringify(metadataCopy, null, 2);
                    // Apply newline replacement here too
                    jsonString = this.replaceNewlines(jsonString);
                    output += `${jsonString} `;
                } catch (err) {
                    output += `[Complex Metadata: ${err.message}] `;
                }
            }

            return output;
        } catch (err) {
            return `[LOG FORMAT ERROR: ${err.message}] Original level: ${level}`;
        }
    }

    log(level, data, metadata) {
        try {
            const output = this.logToString(level, data, metadata);

            // Use appropriate console method based on level
            if (level === 'error') {
                console.error(output);
            } else if (level === 'warn') {
                console.warn(output);
            } else {
                console.log(output);
            }
        } catch (err) {
            // Fallback for any unexpected errors during logging
            console.error(`Churchill ConsoleTransport Error: ${err.message}`);
            console.error(`Failed to log message with level: ${level}`);
        }
    }
}

module.exports = ConsoleTransport;