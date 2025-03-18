# LogIT - Development Plan

## Project Overview

LogIT will consist of two main components:

1. **@logit/client** - Browser-side logging library (distributed via CDN)
2. **@logit/server** - Node.js server component (distributed via npm)

## Repository Structure
```
/LogIT/
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
