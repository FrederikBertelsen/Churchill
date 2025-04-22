"use strict";

// ES5 class helper: Creates getter/setter methods and adds them to constructor prototypes
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    } return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

// Runtime type checking to ensure proper instantiation with 'new' keyword
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Log level priority mapping - lower values indicate higher priority
var _dict = {
    "error": 10,  // Highest priority - critical failures requiring immediate attention
    "warn": 20,   // Important issues that don't stop execution but need attention
    "info": 30,   // General information about application flow
    "debug": 40,  // Detailed information for debugging purposes
    "trace": 50   // Extremely detailed information for tracing code execution
};

// Churchill: A flexible client-side logging system with console and server reporting capabilities
var Churchill = function () {
    // Constructor: Sets up default configuration values for a new logger instance
    function Churchill() {
        this.console = true;        // By default, output logs to console
        this.serverUrl = undefined; // Remote server URL, undefined means no remote logging
        this.level = 'info';        // Default log threshold - only info and higher priority will be logged
        this.useragent = false;     // By default, don't add user agent to logs
    }

    // Dynamically generates logging methods (error, warn, info, debug, trace)
    function _createLevels() {
        var _levelFunctions = []
        Object.keys(_dict).map(function (level) {
            _levelFunctions.push({
                key: level.toString(),
                value: function (data = "") {
                    // Only process logs at or above the configured threshold level
                    if (_dict[level] <= _dict[this.level]) {
                        // if data is a string, put it in an object with key 'message'
                        if (typeof data === "string") {
                            data = {
                                message: data
                            }
                        }
                        var metadata = {
                            url: window.location.href,
                            time: Date.now(),
                        }
                        if (this.useragent) {
                            metadata.useragent = window.navigator.userAgent;
                        }

                        // Prepare payload and differentiate between trace and other levels
                        if (level.toString() === "trace") {
                            if (data && data.message) {
                                var e = new Error(data.message)
                            } else {
                                var e = new Error("Trace log");
                            }
                            metadata.trace = e.stack.split("\n").slice(1).map(function (line) {
                                return line.trim();
                            }).join("\n");

                            if (this.console === true) {
                                console.trace(level, metadata.time);
                            }
                        }

                        var payload = {
                            level: level,
                            data: data,
                            metadata: metadata,
                        };

                        if (this.console === true) {
                            console.log(payload);
                        }

                        // Send logs immediately if server logging is configured
                        if (this.serverUrl !== undefined) {
                            _sendLog(this.serverUrl, payload);
                        }
                    }
                }
            });
        })
        return _levelFunctions
    }

    // Transmits log to the configured server url
    // Uses XMLHttpRequest for broader browser compatibility
    function _sendLog(serverUrl, payload) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", serverUrl, false); // Synchronous POST request
        xhr.setRequestHeader("Content-Type", "application/json");

        // Handle HTTP status errors (4xx, 5xx)
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status >= 400) {
                console.error('Failed to send log:', xhr.statusText);
            }
        };

        // Handle network-level errors (connection refused, timeout, etc.)
        xhr.onerror = function () {
            console.error('Failed to send log: Network error');
        };

        // Send log data as JSON string
        xhr.send(JSON.stringify(payload));
    }

    _createClass(Churchill,
        [
            // Inject dynamically created logging methods (error, warn, info, debug, trace)
            ..._createLevels(),
            {
                key: "config",
                value: function config() {
                    // Accept configuration object with optional parameters
                    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    if (options !== undefined) {
                        // Configure console output (true/false)
                        if (options.console !== undefined) {
                            this.console = options.console;
                        }

                        // Configure server URL for remote logging
                        if (options.serverUrl !== undefined) {
                            this.serverUrl = options.serverUrl;
                        }

                        if (options.level !== undefined) {
                            // Validate log level against predefined dictionary
                            if (options.level in _dict) {
                                this.level = options.level;
                            } else {
                                throw new Error("Invalid log level: " + options.level);
                            }
                        }

                        // Configure useragent setting
                        if (options.useragent !== undefined) {
                            this.useragent = options.useragent;
                        }
                    }

                    // Return this instance for method chaining
                    return this;
                }
            }], [{
                // Factory method: Creates and returns a new pre-configured logger instance
                key: "create",
                value: function create() {
                    this.console = true;
                    this.serverUrl = undefined
                    this.level = "info"

                    return new Churchill();
                }
            }]);

    return Churchill;
}();

// Export Churchill to global scope
if (typeof window !== 'undefined') {
    window.Churchill = Churchill;
}
