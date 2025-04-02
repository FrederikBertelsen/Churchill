'use strict';

const ConsoleTransport = require('./console-transport');

const defaultLevels = {
    error: 10,
    warn: 20,
    info: 30,
    debug: 40,
    trace: 50,
};

const defaultTransports = [
    new ConsoleTransport({
        level: 'info',
    })]

const defaultOptions = {
    levels: defaultLevels,
    level: 'info',
    transports: defaultTransports,
};


module.exports = defaultOptions;