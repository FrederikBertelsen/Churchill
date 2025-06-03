![Churchill logo](/docs/logo.png)

# Churchill

A JS logger meant for easy logging from browsers to a server endpoint

## Project Overview

Churchill will consist of two main components:
1. **@churchill/client** - Browser-side logging library (distributed via CDN)
2. **@churchill/server** - Node.js server component (distributed via npm)

# Installing
```bash
npm i churchill-logger
```

# Using

## Quickstart

If you quickly want to start sending logs from the browser to a server it can be done as such
## Browser

```HTML
<script src="https://unpkg.com/churchill-client@0.1.1/dist/churchill.min.js"></script>
<script>
    const logger = Churchill.create();

    logger.config({
        console: false, //Turns of console logging
        serverUrl: 'https://<url>/<endpoint>' //Url for the server
    })

    logger.info("Hello World!")
</script>
```

Then you create an endpoint with your favorite web application framework and within you put this
## Server
```JS
const churchill = require('churchill-logger/dist');

const logger = churchill.create();

logger.processLog(<payload>)
```

This will then start logging messages from the browser into the servers terminal

## Config

There are different parameters you can use to configure your logger

```JS
logger.config({
    serverUrl: "<Url of the server>",//url of the server
    console: true,//wether it should log to the console
    level: 'debug',//The level of the logger decides that only logs with the same level or higher gets logged
    useragent: false // Wether it should add the useragent to the log or not
})
```

## Repository Structure
```
/Churchill/
├── packages/
│   ├── client/                # Browser client library
│   │   ├── src/
│   │   │   ├── index.js       # Main entry point
│   │   │   ├── logger.js      # Core logging functionality
│   │   │   └── transport.js   # HTTP transport
│   │   ├── dist/              # Built files for distribution
│   │   │   ├── logger.min.js  # For CDN/script tag
│   │   │   └── logger.esm.js  # For bundlers/ES modules
│   │   └── package.json
│   │
│   └── server/                # Node.js server component
│       ├── src/
│       │   ├── index.js       # Main entry point
│       │   ├── logger.js      # Core logging functionality
│       │   ├── receiver.js    # HTTP endpoint for receiving logs
│       │   └── writer.js      # File storage implementation
│       └── package.json
│
├── examples/                  # Example implementations
│   ├── react-app/
│   ├── vanilla-js/
│   └── ...
│
└── package.json          # Root package.json for dev dependencies
```

