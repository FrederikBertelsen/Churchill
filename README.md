![Churchill logo](/docs/logo.png)

# Churchill

[![NPM Downloads](https://img.shields.io/npm/d18m/churchill-logger?label=Logger%20Downloads)](https://www.npmjs.com/package/churchill-logger)
[![NPM Client Downloads](https://img.shields.io/npm/d18m/churchill-client?label=Client%20Downloads)](https://www.npmjs.com/package/churchill-client)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat&labelColor=gray&color=blue)](https://github.com/FrederikBertelsen/Churchill/issues)

A JS logger made for easy logging from browsers to a server endpoint

## Project Overview

Churchill will consist of two main components:
1. **@churchill/client** - Browser-side logging library (distributed via CDN)
2. **@churchill/server** - Node.js server component (distributed via NPM)

# Installation
## Install - Node.js
```bash
npm i churchill-logger
```
## Install - Browser
Simply add this tag to 
```HTML
<script src="https://unpkg.com/churchill-client@latest/dist/churchill.min.js"></script>
```

# Using

## Quickstart

If you just want to start sending logs from the browser to a server it can be done as such

### Browser
```HTML
<script src="https://unpkg.com/churchill-client@latest/dist/churchill.min.js"></script>
<script>
    const logger = Churchill.create();

    logger.config({
        serverUrl: "<URL>", // The log endpoint of the server
        console: true, // Toggles logging to the browser console
        level: 'debug', // The log-level which determines what types of logs that will be logged
        useragent: false // Toggles of adding the user agent to the log object
    })

    logger.info("Hello World!")
</script>
```

Then you create an endpoint with your favorite web application framework and within you put this
### Server (Express example)
```JS
const churchill = require('churchill-logger/dist');

const logger = churchill.create();

// Create log endpoint, and pass log objects to Churchill
app.post('/logs', (req, res) => {

  const success = logger.processLog(req.body)

  res.status(success ? 200 : 400).json({
    status: success ? 'ok' : 'error'
  })
})
```
> [!NOTE]  
> Check our examples for other frameworks


This will then start logging messages from the browser into the servers terminal
