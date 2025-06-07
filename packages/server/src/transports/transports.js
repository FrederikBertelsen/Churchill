'use strict';

module.exports = {
    Console: require('./console-transport'),
    File: require('./file-transport'),
    DuckDB: require('./duckdb-transport')
};