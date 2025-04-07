const {
    SUBLET_API_KEY,
    SUBLET_API_URL,
} = process.env

if (!SUBLET_API_KEY) {
    throw new Error('No agent API key found!')
}
if (!SUBLET_API_URL) {
    throw new Error('No agent API URL found!')
}

const path = require('path')
const util = require('util')
const { createHash } = require('crypto')
const { watch, writeFileSync } = require('fs')
const { io } = require('socket.io-client')
const { updateNSRecords } = require('./subletAgentService')
const { Fetch } = require('engine.io-client')
const configPath = path.resolve(__dirname, './config.js')
let debounceTimeout, config = require(configPath)

function updateConfig(socket) {
    socket.emit('agent:config', config, (ack) => {
        if (ack.error) {
            console.error(`❌ Error sending agent config: ${ack.error}`)
            return
        }
        console.info(`✅ Acknowledgement from server: ${ack.message}`)
    })
}
function loadConfig() {
    console.info(`🔄 Config file changed, reloading...`)

    delete require.cache[require.resolve(configPath)]

    try {
        config = require(configPath)
        console.log('🔄✅ Config reloaded')
    } catch (err) {
        console.error('🔄⚠️ Failed to reload config:', err.message)
    }
}
function init() {
    const defaultHash = '241a2a130eccb4226135eea3375b024eade21567d469ff78422ee7a43eec6ead'
    const currentHash = createHash('sha256').update(JSON.stringify(config)).digest('hex')

    if (process.env.NODE_ENV !== 'production') console.log('🔑 Example config hash:', currentHash)

    if (currentHash === defaultHash) {
        console.warn(`⚠️  You are using the default example config.js

\tCreate your own and mount it like this:

\t👉 docker run --rm -v $(pwd)/config.js:/config.js --env-file .env ghcr.io/june07/sublet`)
    }
    if (!config.agent.id) {
        console.info('⚠️  No agent ID found in config file. Generating one...')
        config.agent.id = Math.random().toString(36).substring(2, 9)

        if (currentHash === defaultHash) {
            console.warn(`
⚠️  It appears that you have not mounted your own config file...

\tNote: Your agent ID will reset every time you run the container unless you mount your own config file.`)
        }
        // wrrite the new config back to the file
        const configString = 'module.exports = ' + util.inspect(config, { depth: null, compact: false }) + '\n'
        writeFileSync(configPath, `${configString}`, 'utf-8')
        console.log('✅ Agent ID saved to config file')
    }
}

init()
const socket = io(SUBLET_API_URL + '/subletAgent', {
    transports: [Fetch],
    extraHeaders: {
        'X-API-Key': SUBLET_API_KEY,
        'X-Agent-Id': config.agent.id,
    },
}).on('connect', () => {
    console.info(`🔗 Connected to Sublet ${socket.nsp} namespace`)

    updateConfig(socket)
}).on('disconnect', reason => {
    console.info(`disconnected from ${socket.nsp} namespace: `, reason)
}).on('error', error => {
    error
})

const pingServer = () => {
    socket.emit('agent:ping', (ack) => {
        if (!ack || ack.error) {
            console.error(`❌ Error sending agent ping: ${ack?.error || 'No response'}`)
        } else {
            console.info(`✅ Acknowledgement from server: ${ack.message}`)
        }
    })
}

// Initial ping
pingServer()

// Continue pinging every 5 minutes
setInterval(pingServer, 300_000)

// Handle DNS update requests
socket.on('updateNS', async (payload, ack) => {
    const { domain, nameservers } = payload

    try {
        await updateNSRecords({ domain, nameservers })
        ack?.({ success: true })
    } catch (err) {
        console.error(`❌ Failed to update NS: ${err.message}`)
        ack?.({ success: false, error: err.message })
    }
})

// Error handling
socket.on('connect_error', err => {
    console.error('Socket connection error:', err.message)
})

socket.on('disconnect', reason => {
    console.warn(`Disconnected: ${reason}`)
})
watch(configPath, (eventType) => {
    if (eventType !== 'change') return

    if (debounceTimeout) {
        clearTimeout(debounceTimeout)
    }
    debounceTimeout = setTimeout(() => {
        loadConfig()
        updateConfig(socket)
    }, 5000)
})
