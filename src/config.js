module.exports = {
    agent: {
        domains: [
            /**
             * This is a minimal configuration example for the agent, the domain name and price is required
             */
            {
                domain: 'awardell.com',
                price: 978
            },
            /**
             * This shows all of the options available
             */
            {
                domain: 'sub-let.space',    // This is the domain name [REQUIRED]
                price: 78,                  // This is the price in USD cents, per term in months (default term is 12 months), the minimum is $0.50 [REQUIRED]
                term: 24                    // Term is in months [OPTIONAL, default: 12]
            }
        ]
    }
}
