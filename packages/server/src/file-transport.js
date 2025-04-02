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
        // File specific options
        this.filename = options.filename || 'logs/app.log';
        this.eol = options.eol !== undefined ? options.eol : require('os').EOL;

        // Try to ensure the directory exists
        this._ensureDirectory();

        return this;
    }

    log(level, message, metadata) {
        const output = this.formatOutput(level, message, metadata);

        try {
            // Append to file
            fs.appendFileSync(this.filename, output + this.eol);
        } catch (err) {
            // If file writing fails, log to console as fallback
            console.error(`Error writing to log file: ${err.message}`);
            console.errir(`Original log: ${output}`);
        }
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