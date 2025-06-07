'use strict';

const Transport = require('./transport');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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

        this.logRotation = options.logRotation || false;
        this.maxsize = options.maxsize || 1 * 1024 * 1024; // 10MB default
        this.rotateDaily = options.rotateDaily || false;
        this.compress = options.compress !== undefined ? options.compress : false;
        
        this._size = 0;
        this._lastRotateDate = this._getCurrentDate();
        // Try to ensure the directory exists
        this._ensureDirectory();
        
        this._getInitialFileSize();
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
            if (this.logRotation) {
                const outputSize = Buffer.byteLength(output + this.eol);
                this._rotateIfNeeded(outputSize);
            }
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

    _getCurrentDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    _getTimestamp() {
        const now = new Date();
        return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    }

    _getInitialFileSize() {
        try {
            const stats = fs.statSync(this.filename);
            this._size = stats.size;
        } catch (err) {
            this._size = 0; // File doesn't exist yet
        }
    }

    _rotateIfNeeded(nextWriteSize) {
        const needRotation = 
            // Size-based rotation

            (this._size + nextWriteSize > this.maxsize) || 
            // Date-based rotation
            (this.rotateDaily && this._getCurrentDate() !== this._lastRotateDate);
        
        if (needRotation) {
            this._rotateLog();
            this._lastRotateDate = this._getCurrentDate();
            this._size = 0;
        }
    }

    _rotateLog() {
        if (!fs.existsSync(this.filename)) {
            return; // Nothing to rotate
        }

        try {
            const dir = path.dirname(this.filename);
            const ext = path.extname(this.filename);
            const basename = path.basename(this.filename, ext);
            const timestamp = this._getTimestamp();

            // Create new rotated log filename
            const rotatedFilename = path.join(dir, `${basename}.${timestamp}${ext}`);
            
            // Rename current log file to rotated name
            fs.renameSync(this.filename, rotatedFilename);
            
            // Compress if needed
            if (this.compress) {
                this._compressFile(rotatedFilename);
            }
            
            return true;
        } catch (err) {
            console.error(`Churchill FileTransport Error: Failed to rotate log: ${err.message}`);
            return false;
        }
    }

    _compressFile(filepath) {
        try {
            const gzip = zlib.createGzip();
            const source = fs.createReadStream(filepath);
            const destination = fs.createWriteStream(`${filepath}.gz`);
            
            source.pipe(gzip).pipe(destination);
            
            destination.on('finish', () => {
                // Delete the original file after compression is complete
                fs.unlinkSync(filepath);
            });
        } catch (err) {
            console.error(`Churchill FileTransport Error: Failed to compress log file "${filepath}": ${err.message}`);
        }
    }
}

module.exports = FileTransport;