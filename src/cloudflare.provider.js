const {
    CLOUDFLARE_EMAIL,
    CLOUDFLARE_API_TOKEN
} = process.env

if (!CLOUDFLARE_EMAIL) {
    throw new Error('No Cloudflare email found!')
} else if (!CLOUDFLARE_API_TOKEN) {
    throw new Error('No Cloudflare API token found!')
}

const zoneCache = {}
let cloudflare

/**
 * Initializes the Cloudflare client.
 * @returns {Promise<void>}
 */
async function initCloudflareClient() {
    const { Cloudflare } = await import('cloudflare')

    cloudflare = new Cloudflare({
        apiEmail: CLOUDFLARE_EMAIL, // Cloudflare email
        apiToken: CLOUDFLARE_API_TOKEN, // Cloudflare API key
    })
}

/**
* Fetches the Zone ID for a given domain.
* @param {string} domain - The domain (e.g., "awardell.com")
* @returns {Promise<string|null>} - The Zone ID or null if not found
*/
async function getZoneId(domain) {
    const primaryDomain = domain.split('.').slice(-2).join('.')

    if (zoneCache[primaryDomain]) return zoneCache[primaryDomain] // Use cached ID if available

    try {
        await initCloudflareClient()

        // Automatically fetches more pages as needed.
        for await (const zone of cloudflare.zones.list({
            status: 'active',
            name: primaryDomain
        })) {
            if (zone) {
                zoneCache[primaryDomain] = zone.id // Cache the Zone ID
                return zone.id
            } else {
                logger.log({ level: 'error', namespace: logNS, message: `No Zone ID found for domain: ${domain}` })
                return
            }
        }
    } catch (error) {
        logger.log({ level: 'error', namespace: logNS, message: `Error fetching Zone ID: ${error.message}`, error })
    }
}
async function updateNSRecords(config) {
    const { domain, nameservers } = config

    try {
        await initCloudflareClient()
        const zoneId = await getZoneId(domain)
        let remainingNameservers = [...nameservers]

        for await (const recordResponse of cloudflare.dns.records.list({
            zone_id: zoneId,
            type: 'NS',
            name: domain
        })) {
            const { id, content } = recordResponse

            if (!nameservers.includes(content)) {
                console.log(`Deleting NS record: ${content} for ${domain}`)
                await cloudflare.dns.records.delete(id, {
                    zone_id: zoneId,
                })
            } else {
                console.log(`NS record already exists: ${content} for ${domain}`)
                // If the record already exists, we can skip adding it again
                remainingNameservers = remainingNameservers.filter(ns => ns !== content)
            }
        }

        if (remainingNameservers.length > 0) {
            console.log(`Adding new NS records for ${domain}: ${remainingNameservers.join(', ')}`)

            for (let nameserver of remainingNameservers) {
                try {
                    // Add new NS records to Cloudflare
                    console.log(`Adding NS record: ${nameserver} for ${domain}`)
                    await cloudflare.dns.records.create({
                        zone_id: zoneId,
                        type: 'NS',
                        name: domain, // Use full domain name for NS record
                        content: nameserver,
                        comment: 'Added by Sublet',
                        ttl: 300,
                    })
                } catch (err) {
                    console.error(`Error adding NS record: ${nameserver} for ${domain}: ${err.message}`)
                }
            }
        }

        console.log(`Successfully synchronized NS records for ${domain}`)
    } catch (error) {
        console.error(`Error updating NS records for ${domain}: ${error.message}`)
    }
}


module.exports = {
    updateNSRecords
}