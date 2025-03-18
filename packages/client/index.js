function Logger() {

    this.console = true;
    this.serverUrl = '';
    this.endpoint = '';

    this.create = function (){
        return this;
    }

    this.log = function (event){
        if (this.console === true){
            console.log(event);
        } 
        const payload = {
            //level: context.level.name,
            data: event
        };

        // Send logs to the server
        fetch(`${this.serverUrl}/${this.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch((error) => console.error('Failed to send log:', error));
    }

    this.config = function (options){
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
        return this;
    }
}

const logger = new Logger();

// Configure the logger to send logs to an external URL
logger.config({
    console: true, // Enable console logging
    serverUrl: 'https://example.com', // Your server URL
});

// Create a log message and send it to both console and server
const log = logger.create();
log.log("This is a test log message");