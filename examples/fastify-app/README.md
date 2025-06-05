# Churchill Fastify Example

This is an example project demonstrating how to use Churchill logging library with Fastify.

## Features

- Fastify web server
- Churchill logger with Console and File transports
- Interactive web interface for testing log messages
- Support for both string and JSON object logging
- Real-time log level filtering

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
# or
npm run dev
```

The application will start on http://localhost:3000

## Usage

1. Open your browser and navigate to http://localhost:3000
2. Choose between String Message or JavaScript Object input
3. Enter your message or modify the JSON object
4. Click any of the log level buttons (Trace, Debug, Info, Warn, Error)
5. View the log history in the browser and check the server console/logs

## Log Files

Log files are written to the `logs/` directory in the project root.

## Churchill Configuration

The logger is configured with:
- Level: `trace` (captures all log levels)
- Transports: Console and File
- Server endpoint: `/logs`
