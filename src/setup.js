#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { program } = require('commander')
const inquirer = require('inquirer').default

const envPath = path.resolve(process.cwd(), 'config/.env.sublet')
const configPath = path.resolve(process.cwd(), 'config/sublet-config.js')
const CACHE_FILE = path.join(process.cwd(), 'config/.sublet-cli.json')
let chalk

function loadDefaults() {
    try {
        return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'))
    } catch {
        return {}
    }
}

function saveDefaults(newAnswers) {
    const updated = { ...loadDefaults(), ...newAnswers }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(updated, null, 2))
}
const defaults = loadDefaults()

const promptEnv = async () => {
    const questions = [
        {
            name: 'SUBLET_API_KEY',
            message: 'Sublet API key:',
            default: defaults.SUBLET_API_KEY,
            validate: input => {
                const regex = /^sublet-apikey-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                return regex.test(input) || 'Must be a valid Sublet API key starting with "sublet-apikey-"'
            }
        },
        {
            name: 'CLOUDFLARE_EMAIL',
            message: 'Your Cloudflare email:',
            default: defaults.CLOUDFLARE_EMAIL,
            validate: input => {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                return regex.test(input) || 'Please enter a valid email address'
            }
        },
        {
            name: 'CLOUDFLARE_API_TOKEN',
            message: 'Your Cloudflare API token:',
            default: defaults.CLOUDFLARE_API_TOKEN
        }
    ]

    const answers = {}

    for (const question of questions) {
        const answer = await inquirer.prompt([{ type: 'input', ...question }])
        const key = Object.keys(answer)[0]
        answers[key] = answer[key]
        saveDefaults({ ...loadDefaults(), ...answers }) // merge and persist after each
    }

    return answers
}


const promptDomains = async () => {
    const domains = []

    let addMore = true
    while (addMore) {
        const { domain, price, term } = await inquirer.prompt([
            {
                type: 'input',
                name: 'domain',
                message: 'Domain name to lease (e.g. mydomain.com):',
                validate: input => !!input || 'Domain is required'
            },
            {
                type: 'number',
                name: 'price',
                message: `Price in cents (e.g. 500 = $5)${defaults.lastPrice ? ` [default: ${defaults.lastPrice}]` : ''}:`,
                default: defaults.lastPrice,
                validate: input => input >= 50 || 'Minimum is $0.50 (50 cents)'
            },
            {
                type: 'number',
                name: 'term',
                message: 'Term in months (optional):',
                default: 12,
            }
        ])
        domains.push({ domain, price, term })
        addMore = (await inquirer.prompt({
            type: 'confirm',
            name: 'continue',
            message: 'Add another domain?',
            default: false
        })).continue
    }

    return domains
}

const writeEnvFile = (envVars) => {
    const content = Object.entries(envVars)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n')
    fs.writeFileSync(envPath, content + '\n')
    console.log(chalk.green(`✅ .env.sublet file written to ${envPath}`))
}

const writeConfigFile = (domains) => {
    const agentId = Math.random().toString(36).substring(2, 9)
    const configObject = {
        agent: {
            id: agentId,
            domains
        }
    }
    const code = 'module.exports = ' + JSON.stringify(configObject, null, 4) + '\n'
    fs.writeFileSync(configPath, code)
    console.log(chalk.green(`✅ sublet-config.js file written to ${configPath}`))
    return agentId
}

const outputDockerCommand = () => {
    console.log(chalk.cyan('\n🚀 To run your agent:\n'))
    console.log(`docker run --rm -v $(pwd)/sublet-config.js:/usr/src/app/config.js --env-file .env.sublet ghcr.io/june07/sublet`)
    console.log()
}

program
    .name('Sublet Agent Onboarding')
    .description('Create config and .env.sublet for Sublet agent')
    .action(async () => {
        const envVars = await promptEnv()
        const domains = await promptDomains()
        chalk = (await import('chalk')).default

        writeEnvFile(envVars)

        const agentId = writeConfigFile(domains)

        console.log(chalk.yellow(`\nAgent ID: ${agentId}`))
        outputDockerCommand()
    })

program.parse()
