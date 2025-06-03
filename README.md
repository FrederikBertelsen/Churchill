![Churchill logo](/docs/logo.png)

# Churchill

[![NPM Client Downloads](https://img.shields.io/npm/d18m/churchill-client?label=NPM%20Installs)](https://www.npmjs.com/package/churchill-client)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat&labelColor=gray&color=blue)](https://github.com/FrederikBertelsen/Churchill/issues)


⭐ Star us on GitHub — it motivates us a lot!

[![Share](https://img.shields.io/badge/share-000000?logo=x&logoColor=white)](https://x.com/intent/tweet?text=Check%20out%20this%20project%20on%20GitHub:%20https://github.com/FrederikBertelsen/Churchill%20%23OpenIDConnect%20%23Security%20%23Authentication)
[![Share](https://img.shields.io/badge/share-1877F2?logo=facebook&logoColor=white)](https://www.facebook.com/sharer/sharer.php?u=https://github.com/FrederikBertelsen/Churchill)
[![Share](https://img.shields.io/badge/share-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/submit?title=Check%20out%20this%20project%20on%20GitHub:%20https://github.com/FrederikBertelsen/Churchill)
[![Share](https://img.shields.io/badge/share-0088CC?logo=telegram&logoColor=white)](https://t.me/share/url?url=https://github.com/FrederikBertelsen/Churchill&text=Check%20out%20this%20project%20on%20GitHub)

## Table of Content
- [Churchill](#churchill)
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
    - [Custom transport](#custom-transport)
    - [License link footer](#license-link-footer)


## About

A JS logger made for easy logging from browsers to a server endpoint

Churchill will consist of two main components:
1. **@churchill/client** - Browser-side logging library (distributed via CDN)
2. **@churchill/server** - Node.js server component (distributed via NPM)

## Installation
### Install - Node.js
```bash
npm i churchill-logger
```
## Install - Browser
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

### Loglevels


### Server Config Options
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
### Custom transport
### License link footer