"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dict = {
    "fatal": 10,
    "error": 20,
    "warn": 30,
    "info": 40,
    "debug": 50,
    "trace": 60
};

var Logger = function () {
    function Logger() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Logger);

        this.console = true;
        this.serverUrl = undefined;
        this.endpoint = undefined;
        this.level = 'info';
        this.config(options);
    }

    _createClass(Logger, [{
        key: "log",
        value: function log(event) {
            var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";

            if (typeof level === 'number') {
                level = Object.keys(dict).find(function (key) {
                    return dict[key] === level;
                });
            }
            if (dict[level] <= dict[this.level]) {
                if (this.console === true) {
                    console.log(level, event);
                }
                var payload = {
                    level: level,
                    data: event
                };
                if (this.serverUrl !== undefined & this.endpoint !== undefined){
                    // Send logs to the server
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", this.serverUrl + this.endpoint, true);
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
            }
        }
    }, {
        key: "config",
        value: function config() {
            var _this = this;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            if (options !== undefined) {

                if (options.console !== undefined) {
                    this.console = options.console; // Enable/disable console logging
                }
                if (options.serverUrl !== undefined) {
                    this.serverUrl = options.serverUrl; // Set server URL for remote logging
                }
                if (options.port !== undefined) {
                    this.port = options.port; // Set the server port (default 80)
                }
                if (options.endpoint !== undefined) {
                    this.endpoint = options.endpoint;
                }
                Object.keys(dict).forEach(function (level) {
                    _this[level] = function (message) {
                        _this.log(message, level);
                    };
                });
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
            return new Logger();
        }
    }]);

    return Logger;
}();
