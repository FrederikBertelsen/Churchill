<h1 align="center">
  <br>
  <img src="/docs/logo.png" alt="Churchill Logger">
</h1>
<h4 align="center">A JS logger made for easy logging from browsers to a server endpoint.</h4>

<p align="center">
    <a href="https://www.npmjs.com/package/churchill-client">
        <img src="https://img.shields.io/npm/d18m/churchill-client?label=NPM%20Installs" alt="NPM Client Downloads">
    </a>
    <a href="https://github.com/FrederikBertelsen/Churchill/issues">
        <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat&labelColor=gray&color=blue" alt="Contributions Welcome">
    </a>
</p>

<p align="center">
    ⭐ Star us on GitHub — it motivates us a lot!
</p>

<p align="center">
    <a href="https://x.com/intent/tweet?text=Check%20out%20this%20project%20on%20GitHub:%20https://github.com/FrederikBertelsen/Churchill%20%23OpenIDConnect%20%23Security%20%23Authentication">
        <img src="https://img.shields.io/badge/share-000000?logo=x&logoColor=white" alt="Share on X">
    </a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=https://github.com/FrederikBertelsen/Churchill">
        <img src="https://img.shields.io/badge/share-1877F2?logo=facebook&logoColor=white" alt="Share on Facebook">
    </a>
    <a href="https://www.reddit.com/submit?title=Check%20out%20this%20project%20on%20GitHub:%20https://github.com/FrederikBertelsen/Churchill">
        <img src="https://img.shields.io/badge/share-FF4500?logo=reddit&logoColor=white" alt="Share on Reddit">
    </a>
    <a href="https://t.me/share/url?url=https://github.com/FrederikBertelsen/Churchill&text=Check%20out%20this%20project%20on%20GitHub">
        <img src="https://img.shields.io/badge/share-0088CC?logo=telegram&logoColor=white" alt="Share on Telegram">
    </a>
</p>

## Table of Content
- [Table of Content](#table-of-content)
- [About](#about)
- [Installation](#installation)
  - [Install - Node.js](#install---nodejs)
  - [Install - Browser](#install---browser)
- [Quickstart](#quickstart)
  - [Browser](#browser)
  - [Server (Express example)](#server-express-example)
- [Loglevels](#loglevels)
- [Server Config Options](#server-config-options)
- [Transports](#transports)
  - [Custom Transport](#custom-transport)
- [License](#license)


## About

A JS logger made for easy logging from browsers to a server endpoint

Churchill consists of two main components:
1. **@churchill/client** - Browser-side logging library (distributed via CDN)
2. **@churchill/server** - Node.js server component (distributed via NPM)

## Installation

### Install - Node.js
```bash
npm i churchill-logger
```
### Install - Browser
Simply add this tag to 
```HTML
<script src="https://unpkg.com/churchill-client@latest/dist/churchill.min.js"></script>
```


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
> Check our [examples folder](https://github.com/FrederikBertelsen/Churchill/tree/main/examples) for other framework examples

This will then start logging messages from the browser into the servers terminal

## Loglevels
The loglevels are lables that define the importance of log messages
The levels can be assigned both to messages but alos the loggers themselves

Loglevels for messages are assigned using the built in level functions for the loggers.

```JS
logger.trace("Hello")
logger.debug("Hello")
logger.info("Hello")
logger.warn("Hello")
logger.error("Hello")
```

Using these levels the logger can differentiate between the importance of the loggers, and by assigning a level to the logger itself
```JS
logger.config({
    level: "info"
})
```
you can sort out logs with lower importance than the logger itself.

Other than this the level functions have the same functionality as any other log function except the trace level that also gives the stacktrace

## Server Config Options
```javascript
// Configure server-side logger with transports
const logger = churchill.create({
  level: 'debug',
  transports: [
    new churchill.transports.Console(),
    new churchill.transports.File({ filename: 'logs/app.log' })
  ]
});
```
## Transports
Churchill uses transports to determine where logs are sent. The library comes with two built-in transports:

Using the Console transport (default):
```javascript
const logger = churchill.create({
  level: 'debug',
  transports: [
    new churchill.transports.Console()
  ]
});
```

Using the File transport:
```javascript
const logger = churchill.create({
  level: 'info',
  transports: [
    new churchill.transports.File({ filename: 'logs/app.log' })
  ]
});
```

Using multiple transports:
```javascript
const logger = churchill.create({
  level: 'debug',
  transports: [
    new churchill.transports.Console({ level: 'error' }), // Only errors to console
    new churchill.transports.File({ filename: 'logs/app.log' }) // All logs to file
  ]
});
```

### Custom Transport
You can create your own transports, by extending from the `Churchill.Transport` class.

You need to overwrite the `Log()` function.

```javascript
class DatabaseTransport extends churchill.Transport {
  constructor(options) {
    super(options);
    // Initialize your database connection
    this.db = options.db;
  }
  
  log(level, data, metadata) {
    // Implement database logging logic
    this.db.collection('logs').insertOne({
      level,
      message: data,
      metadata,
      timestamp: new Date()
    });
  }
}
```
You can then use it like the other transports, by adding it to the transport array argument.
```javascript
const logger = churchill.create({
  transports: [new DatabaseTransport({ db: myDatabaseConnection })]
});
```

## License
This project is licensed under a modified MIT License - check [LICENSE](/LICENSE) for details.
