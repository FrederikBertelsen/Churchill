'use strict';

const Transport = require('./transport');
const fs = require('fs');
const path = require('path');

class FileTransport extends Transport {
    constructor(options = {}) {
        super(options);

        this.configure(options);
    }

    configure(options = {}) {
        super.configure(options);

        // File specific options
        this.filename = options.filename || 'logs/app.log';
        this.timestamp = options.timestamp !== false;
        this.eol = options.eol !== undefined ? options.eol : require('os').EOL;

        // Try to ensure the directory exists
        this._ensureDirectory();

        return this;
    }

    log(level, message, metadata) {
        if (!this.shouldLog(level)) return;

        const output = this._formatOutput(level, message, metadata);

        try {
            // Append to file
            fs.appendFileSync(this.filename, output + this.eol);
        } catch (err) {
            // If file writing fails, log to console as fallback
            console.error(`Error writing to log file: ${err.message}`);
            console.errir(`Original log: ${output}`);
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

    _ensureDirectory() {
        const dir = path.dirname(this.filename);

        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
            } catch (err) {
                console.error(`Error creating log directory: ${err.message}`);
            }
        }
    }
}

module.exports = FileTransport;