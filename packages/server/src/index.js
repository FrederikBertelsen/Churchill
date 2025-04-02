'use strict';

/**
 * @type {string}
 */
exports.version = require('../package.json').version;

/**
 * @type {function}
 */
exports.create = require('./create-logger');

/**
 * @type {object}
 */
exports.defaultOpts = require('./defaultOptions');

/**
 * @type {object}
 */
exports.transports = require('./transports');

/**
 * @type {class}
 */
exports.Transport = require('./transport');