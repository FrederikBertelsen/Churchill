'use strict';

const Logger = require('./logger');
const defaultOptions = require('./defaultOptions');

/**
 * @param {!Object} opts
 * @returns {Logger}
 */
module.exports = function (options = defaultOptions) {
    const logger = new Logger(options);
    return logger;
};