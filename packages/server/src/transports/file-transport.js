'use strict';

const Transport = require('./transport');
const fs = require('fs');
const path = require('path');

class FileTransport extends Transport {
    constructor(options = {}) {
        super(options);

        // Validate filename
        if (options.filename !== undefined && typeof options.filename !== 'string') {
            throw new Error(`Invalid filename: expected string, got ${typeof options.filename}`);
        }

        // File specific options
        this.filename = options.filename || 'logs/app.log';
        this.eol = options.eol !== undefined ? options.eol : require('os').EOL;

        // Try to ensure the directory exists
        this._ensureDirectory();
    }

    logToString(level, data, metadata) {
        if (typeof data === 'string') {
            data = { message: data };
        }
        const json = { level: level, data: data, metadata: metadata };

        try {
            return JSON.stringify(json);
        } catch (err) {
            // Handle circular references or other JSON stringification issues
            console.error(`Error stringifying log data: ${err.message}`);
            // Try to create a safer version of the data for logging
            const safeJson = {
                level: level,
                data: typeof data === 'object' ? '[Complex Object]' : String(data),
                metadata: typeof metadata === 'object' ? '[Complex Object]' : String(metadata),
                error: `Failed to stringify original: ${err.message}`
            };
            return JSON.stringify(safeJson);
        }
    }

    log(level, data, metadata) {
        const output = this.logToString(level, data, metadata);

        try {
            // Append to file
            fs.appendFileSync(this.filename, output + this.eol);
        } catch (err) {
            // If file writing fails, log to console as fallback
            console.error(`Churchill FileTransport Error: Failed to write to log file "${this.filename}": ${err.message}`);
            console.error(`Original log: ${output}`);
        }
    }

    _ensureDirectory() {
        const dir = path.dirname(this.filename);

        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (err) {
                console.error(`Churchill FileTransport Error: Failed to create log directory "${dir}": ${err.message}`);
                console.error(`Please ensure the directory "${dir}" exists and is writable, or configure a different log path.`);
            }
        } else {
            // Check if directory is writable
            try {
                const testFile = path.join(dir, '.churchill-write-test');
                fs.writeFileSync(testFile, '');
                fs.unlinkSync(testFile);
            } catch (err) {
                console.error(`Churchill FileTransport Error: Log directory "${dir}" exists but is not writable: ${err.message}`);
                console.error(`Please ensure the directory has proper write permissions.`);
            }
        }
    }
}

module.exports = FileTransport;