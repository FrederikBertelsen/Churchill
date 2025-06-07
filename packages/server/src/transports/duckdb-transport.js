'use strict';

const Transport = require('./transport');
const path = require('path');
const fs = require('fs');

// Check if the duckdb package is available
let duckdb;
try {
    duckdb = require('duckdb');
} catch (err) {
    throw new Error('Churchill DuckDBTransport requires the "duckdb" package. Install it with: npm install duckdb');
}

class DuckDBTransport extends Transport {
    constructor(options = {}) {
        super(options);

        if (options.database !== undefined && typeof options.database !== 'string') {
            throw new Error(`Invalid database path: expected string, got ${typeof options.database}`);
        }

        this.database = options.database || 'logs/churchill.duckdb';
        this.tableName = options.tableName || 'logs';

        this._initDatabase();
    }

    _initDatabase() {
        try {
            // Ensure directory exists
            const dir = path.dirname(this.database);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            this.db = new duckdb.Database(this.database);
            this.connection = this.db.connect();

            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${this.tableName} (
                    id BIGINT PRIMARY KEY,
                    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    level VARCHAR NOT NULL,
                    message TEXT,
                    data TEXT,
                    metadata TEXT,
                    created_at BIGINT
                )
            `;

            this.connection.run(createTableQuery, (err) => {
                if (err) {
                    console.error(`Churchill DuckDBTransport Error: Failed to create table: ${err.message}`);
                }
            });

        } catch (err) {
            console.error(`Churchill DuckDBTransport Error: Database initialization failed: ${err.message}`);
        }
    }

    _safeStringify(obj, fallback = '{}') {
        try {
            return obj ? JSON.stringify(obj) : fallback;
        } catch (err) {
            console.error(`Churchill DuckDBTransport Error: Failed to stringify: ${err.message}`);
            return JSON.stringify({ error: 'Failed to stringify data' });
        }
    }

    _processLogData(data) {
        if (typeof data === 'string') {
            return {
                message: data,
                dataJson: JSON.stringify({ message: data })
            };
        }

        if (data && typeof data === 'object') {
            return {
                message: data.message || null,
                dataJson: this._safeStringify(data)
            };
        }

        return { message: null, dataJson: '{}' };
    }

    log(level, data, metadata) {
        if (!this.connection) {
            console.error('Churchill DuckDBTransport Error: Database not initialized');
            return;
        }

        try {
            const { message, dataJson } = this._processLogData(data);
            const metadataJson = this._safeStringify(metadata);

            const timestamp = metadata?.time ? new Date(metadata.time) : new Date();
            const createdAt = metadata?.time || Date.now();
            const logId = Date.now() + Math.floor(Math.random() * 1000);

            // Use parameterized query to avoid SQL injection
            const query = `INSERT INTO ${this.tableName} (id, level, message, data, metadata, created_at, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const params = [logId, level || 'info', message || '', dataJson, metadataJson, createdAt, timestamp.toISOString()];

            this.connection.run(query, ...params, (err) => {
                if (err) {
                    console.error(`Churchill DuckDBTransport Error: Failed to insert log: ${err.message}`);
                }
            });

        } catch (err) {
            console.error(`Churchill DuckDBTransport Error: Failed to process log entry: ${err.message}`);
        }
    }

    close() {
        if (this.connection) {
            this.connection.close();
        }
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = DuckDBTransport;
