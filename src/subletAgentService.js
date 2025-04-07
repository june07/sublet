const {
    SUBLET_API_KEY
} = process.env

if (!SUBLET_API_KEY) {
    throw new Error('No agent API key found!')
}

const providers = {
    cloudflare: require('./cloudflare.provider.js'),
}

async function updateNSRecords(config) {
    const { provider = 'cloudflare' } = config
    
    try {
        providers[provider].updateNSRecords(config)
    } catch (error) {
        throw error
    }
}


module.exports = {
    updateNSRecords
}