const createLogger = require('../src/create-logger');
const defaultOptions = require('../src/defaultOptions');

'use strict';


describe('createLogger', () => {
    let consoleSpy;

    beforeEach(() => {
        // Mock console.log to avoid test output pollution
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    test('creates a logger with default methods', () => {
        const logger = createLogger();

        // Check default methods exist
        expect(typeof logger.debug).toBe('function');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
        expect(typeof logger.fatal).toBe('function');
    });

    test('creates logger with default level', () => {
        const logger = createLogger();

        // debug should not log
        logger.debug('debug message');
        expect(consoleSpy).not.toHaveBeenCalled();

        // info should log (matches default level)
        logger.info('info message');
        expect(consoleSpy).toHaveBeenCalledWith('[info] info message');
    });

    test('logger methods log messages with correct level prefix', () => {
        const logger = createLogger({ level: 'debug' });

        logger.debug('test debug message');
        expect(consoleSpy).toHaveBeenCalledWith('[debug] test debug message');

        logger.error('test error message');
        expect(consoleSpy).toHaveBeenCalledWith('[error] test error message');
    });

    test('creates logger with custom levels', () => {
        const customLevels = {
            trace: 10,
            notice: 20,
            critical: 30,
        };

        const logger = createLogger({
            levels: customLevels,
            level: 'notice'
        });

        // Custom methods should exist
        expect(typeof logger.trace).toBe('function');
        expect(typeof logger.notice).toBe('function');
        expect(typeof logger.critical).toBe('function');

        // Default methods not included in custom levels should not exist
        expect(logger.info).toBeUndefined();
        expect(logger.warn).toBeUndefined();
    });

    test('throws error for invalid level', () => {
        expect(() => {
            createLogger({ level: 'nonexistent' });
        }).toThrow('Unknown level: nonexistent');
    });

    test('level filtering follows string comparison', () => {
        const logger = createLogger({
            level: 'info'
        });

        // debug < info alphabetically, so won't log
        logger.debug('debug message');
        expect(consoleSpy).not.toHaveBeenCalled();

        // info == info, so will log
        logger.info('info message');
        expect(consoleSpy).toHaveBeenCalledWith('[info] info message');

        // warn > info alphabetically, so will log
        logger.warn('warn message');
        expect(consoleSpy).toHaveBeenCalledWith('[warn] warn message');
    });

    test('level filtering works with numerical levels', () => {
        const levels = {
            error: 1,
            warn: 2,
            info: 3,
            debug: 4
        };

        const logger = createLogger({
            levels,
            level: 3 // Only info and higher should log
        });

        logger.debug('debug message');
        expect(consoleSpy).not.toHaveBeenCalled();

        logger.info('info message');
        expect(consoleSpy).toHaveBeenCalledWith('[info] info message');

        logger.warn('warn message');
        expect(consoleSpy).toHaveBeenCalledWith('[warn] warn message');
    });
});