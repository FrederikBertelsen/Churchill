'use strict';

const Logger = require('./logger');
const defaultOptions = require('./defaultOptions');

module.exports = function (options = defaultOptions) {    
    const logger = new Logger(options);
    return logger;
};