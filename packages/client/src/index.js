"use strict";

// ES5 class helper: Creates getter/setter methods and adds them to constructor prototypes
// This is part of the ES5 class implementation pattern
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
        return Constructor; }; }();

// Runtime type checking to ensure proper instantiation with 'new' keyword
// Prevents calling the constructor as a regular function
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Log level priority mapping - lower values indicate higher priority
// This determines which logs will be displayed based on configured level threshold
var _dict = {
    "error": 10,  // Highest priority - critical failures requiring immediate attention
    "warn": 20,   // Important issues that don't stop execution but need attention
    "info": 30,   // General information about application flow
    "debug": 40,  // Detailed information for debugging purposes
    "trace": 50   // Extremely detailed information for tracing code execution
};

// Queue for storing log entries before they're sent to the server
var _batch = [];
// Number of log entries to collect before sending a batch to the server
var _batchSize = 10;
// Time in milliseconds between automatic batch transmissions (10 seconds)
var _batchInterval = 10000;

var _loggerintervals = [] // Array to store logger IDs for batch processing


// Churchill: A flexible client-side logging system with console and server reporting capabilities
var Churchill = function () {
    // Constructor: Sets up default configuration values for a new logger instance
    function Churchill() {
        this.console = true;        // By default, output logs to console
        this.serverUrl = undefined; // Remote server URL, undefined means no remote logging
        this.endpoint = undefined;  // API endpoint path for log submission
        this.level = 'info';        // Default log threshold - only info and higher priority will be logged
        this._batchEnabled = false; // Batching disabled by default until server config provided
    }

    // Dynamically generates logging methods (error, warn, info, debug, trace)
    // This creates functions that will be attached to the Churchill prototype
    function _createLevels() {
        var _levelFunctions = []
        Object.keys(_dict).map(function (level) {
            _levelFunctions.push({
                key: level.toString(),
                value: function (message="") {
                    // Only process logs at or above the configured threshold level
                    if (_dict[level] <= _dict[this.level]) {
                        // Output to browser console if enabled
                        
                        
                        // Prepare payload and differentiate between trace and other levels
                        if (level.toString() === "trace"){
                            var e = new Error(message)
                            var payload = {
                                level: level,   
                                data: e.trace
                            };
                            if (this.console === true) {
                                console.trace(level);
                            }
                            
                        } else {
                            var payload = {
                                level: level,
                                data: message
                            };
                            if (this.console === true) {
                                console.log(payload);
                            }
                        }

        
                        // Add to batch queue if server logging is enabled
                        if (this._batchEnabled) {
                            _batch.push(payload);
                        }
        
                        // Send batch immediately if we've reached the batch size threshold
                        if (this.serverUrl !== undefined & this.endpoint !== undefined & _batch.length >= _batchSize ) {
                            _sendBatch(this.serverUrl, this.endpoint);
                        }
                    }
                }
            });
        })
        return _levelFunctions
    }
    
    // Transmits accumulated logs to the configured server endpoint
    // Uses XMLHttpRequest for broader browser compatibility
    function _sendBatch(serverUrl, endpoint) {
        if (_batch.length > 0) {
            console.log(endpoint)
            console.log(serverUrl)
            var xhr = new XMLHttpRequest();
            xhr.open("POST", serverUrl + endpoint, true); // Asynchronous POST request
            xhr.setRequestHeader("Content-Type", "application/json");
            
            // Remove all items from batch and prepare for transmission
            var logsToSend = _batch.splice(0, _batch.length);
            
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
            xhr.send(JSON.stringify(logsToSend));
        }
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
                
                // Configure server port if needed
                if (options.port !== undefined) {
                    this.port = options.port;
                }
                
                // Set API endpoint path for log submission
                if (options.endpoint !== undefined) {
                    this.endpoint = options.endpoint;
                }
                
                // When both server URL and endpoint are provided, enable batch mode
                // and set up automatic transmission
                if (options.serverUrl !== undefined & options.endpoint !== undefined) {
                    this._batchEnabled = true
                    _classCallCheck(this, Churchill);
                    

                    
                    // Schedule periodic batch transmissions and remove if logger is reconfigured
                    _loggerintervals.forEach((element, index) => {
                    // If logger already exists, clear the existing interval
                        if (_loggerintervals[index].value !== undefined) {
                            clearInterval(_loggerintervals[index].value);
                            _loggerintervals[index].value = undefined;
                        }
                        console.log(element.value)
                        if (element.value === undefined) {
                            const intervalId = setInterval(() => {
                                _sendBatch(options.serverUrl, options.endpoint);
                            }, _batchInterval);
                            _loggerintervals[index] = { key: this.id, value: intervalId };
                            console.log("Interval set for logger ID: " + this.id, " Interval ID: " + intervalId);
                        }
                        
                    });

                    
                    // Ensure any remaining logs are sent when page unloads
                    window.addEventListener("beforeunload", () => {
                        _sendBatch(options.serverUrl, options.endpoint)
                    });
                }
            }

            // Return this instance for method chaining
            return this;
        }
    }], [{
        // Factory method: Creates and returns a new pre-configured logger instance
        // Provides a cleaner interface than using the constructor directly
        key: "create",
        value: function create() {
            this.console = true;
            this.serverUrl = undefined
            this.endpoint = undefined
            this.level = "info"
            this.id = _loggerintervals.length + 1
            _loggerintervals.push({ key: this.id, value: undefined });

            return new Churchill();
        }
    }]);

    return Churchill;
}();
