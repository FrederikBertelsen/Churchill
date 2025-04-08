"use strict";

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
// Prevents calling the constructor as a regular function
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Churchill: A flexible client-side logging system with console and server reporting capabilities
var Churchill = function () {
    // Constructor: Sets up default configuration values for a new logger instance
    function Churchill() {
        _classCallCheck(this, Churchill);
        this.console = true;
        this.serverUrl = undefined;
        this.endpoint = undefined;
        this.level = 'info';
        this.useragent = false;
    }

    // Dynamically generates logging methods (error, warn, info, debug, trace)
    // This creates functions that will be attached to the Churchill prototype
    function _createLevels() {
        var _levelFunctions = []
        var _dict = {
            "error": 10,
            "warn": 20,
            "info": 30,
            "debug": 40,
            "trace": 50
        };
        Object.keys(_dict).map(function (level) {
            _levelFunctions.push({
                key: level.toString(),
                value: function (data) {
                    // check if we should log at the log level
                    if (_dict[level] <= _dict[this.level]) {

                        // if data is a string, put it in an object with key 'message'
                        if (typeof data === "string") {
                            data = {
                                message: data
                            }
                        }

                        var metadata = {
                            time: Date.now(),
                        }

                        if (this.useragent) {
                            metadata.useragent = window.navigator.userAgent;
                        }

                        var payload = {
                            level: level,
                            data: data,
                            metadata: metadata
                        };

                        if (this.console === true) {
                            console.log(payload);
                        }

                        if (this.serverUrl !== undefined & this.endpoint !== undefined) {
                            // Send logs to the server
                            _sendBatch(this.serverUrl, this.endpoint, payload);
                        }
                    }
                }
            });
        })
        return _levelFunctions
    }

    function _sendBatch(serverUrl, endpoint, payload) {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", serverUrl + endpoint, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status >= 400) {
                console.error('Failed to send log:', xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.error('Failed to send log: Network error');
        };

        xhr.send(JSON.stringify(payload));

    }

    _createClass(Churchill,

        [
            ..._createLevels(),
            {
                key: "config",
                value: function config() {
                    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    if (options !== undefined) {

                        if (options.console !== undefined) {
                            this.console = options.console; // Enable/disable console logging
                        }
                        if (options.serverUrl !== undefined) {
                            this.serverUrl = options.serverUrl; // Set server URL for remote logging
                        }
                        if (options.endpoint !== undefined) {
                            this.endpoint = options.endpoint;
                        }
                        if (options.level !== undefined) {
                            this.level = options.level; // Set minimum log level
                        }
                        if (options.useragent !== undefined) {
                            this.useragent = options.useragent; // Set minimum log level
                        }
                    }

                    return this;
                }
            }], [{
                key: "create",
                value: function create() {
                    this.console = true;
                    this.serverUrl = undefined;
                    this.endpoint = undefined;
                    this.level = "info";

                    return new Churchill();
                }
            }]);

    return Churchill;
}();

// Export Churchill to global scope
if (typeof window !== 'undefined') {
    window.Churchill = Churchill;
}
