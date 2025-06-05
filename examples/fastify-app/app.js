const fastify = require('fastify')({ logger: false })
const churchill = require('churchill-logger')
const path = require('path')

// Create a logger with multiple transports
const logger = churchill.create({
    level: 'trace',
    transports: [
        new churchill.transports.Console(),
        new churchill.transports.File(),
    ]
})

// Register the static files plugin
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/',
})

// Create a specific endpoint for logs
fastify.post('/logs', async (request, reply) => {
    try {
        const success = logger.processLog(request.body)
        return {
            status: success ? 'ok' : 'error'
        }
    } catch (error) {
        reply.code(400)
        return {
            status: 'error',
            message: error.message
        }
    }
})

// Root route to serve the main page
fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html')
})

// Start the server
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' })
        console.log('Fastify app listening on port 3000')
        console.log('Open http://localhost:3000 in your browser to test the logger')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
