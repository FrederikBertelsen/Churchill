'use strict';

/**
 * @type {string}
 */
exports.version = require('../package.json').version;

/**
 * @type {function}
 */
exports.createLogger = require('./create-logger');


/**
 * @type {object}
 */
exports.defaultOpts = require('./defaultOptions');