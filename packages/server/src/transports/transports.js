'use strict';

const transports = {
    Console: require('./console-transport'),
    File: require('./file-transport')
};

// Attempt to load DuckDB transport if available
try {
    if (require.resolve('duckdb')) {
        transports.DuckDB = require('./duckdb-transport');
    }
} catch (err) { }

module.exports = transports;