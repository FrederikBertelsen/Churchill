const dict = {
    "fatal": 10,
    "error": 20,
    "warn": 30,
    "info": 40,
    "debug": 50,
    "trace": 60,  
};

class Logger {

    constructor(options = {}) {
        this.console = true;
        this.serverUrl = undefined;
        this.endpoint = undefined;
        this.level = 'info';
        this.config(options);
    }

    static create(){
        this.console = true;
        this.serverUrl = undefined;
        this.endpoint = undefined;
        this.level = "info";
        return (new Logger);
    }

    log(event, level = "info"){
        if (typeof level === 'number') {
            level = Object.keys(dict).find(key => dict[key] === level);

        }
        if (dict[level] >= dict[this.level]){
            if (this.console === true){
                console.log(level, event);
            } 
            const payload = {
                level: level,
                data: event
            };
        if (this.serverUrl !== undefined & this.endpoint !== undefined)
            // Send logs to the server
            fetch(`${this.serverUrl}${this.endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }).catch((error) => console.error('Failed to send log:', error));
        }
    }

    config(options = {}){
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
            if (options.endpoint !== undefined){
                this.endpoint = options.endpoint
            }
            Object.keys(dict).forEach(level => {
                this[level] = (message) => {
                    this.log(message, level);
                };
            });
        }   
        
        return this;
    }
}

//Create new logger
const logger = Logger.create()

// Configure the logger to send logs to an external URL
logger.config({
    console: true, // Enable console logging
    serverUrl: 'https://bachelor.15263748.xyz/', // Your server's URL
    endpoint: '/api/event' // Your browser endpoint
});