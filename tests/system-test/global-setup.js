import { exec } from 'child_process'
import { promisify } from 'util'
import { white, grey, blue, white_bold, blue_bold, green_bold, red_bold, reset, up_one_line, carriage_return, clear_line } from '../helpers/terminal-output'
import { checkInterruption, sleep } from '../helpers/tools'

const execAsync = promisify(exec)

// Flag to indicate if interruption signal was received from parent process
// i.e. from the ./test shell script (when Ctrl+C is pressed)
global.isSetupInterrupted = false
process.on('SIGINT', () => global.isSetupInterrupted = true)

const removeAnyDeadContainers = async () => {
    await checkInterruption()
    await execAsync('docker compose -f docker-compose.test.yml down').catch(() => {})
}

const waitForBuild = async (timeout = 60) => {
    await checkInterruption()
    process.stdout.write(`  ${blue_bold}•${reset} Building app...\n`)

    let remaining        = timeout,
        countdown_active = true

    const build_process = execAsync('docker compose -f docker-compose.test.yml build --no-cache test-app').then(() => { countdown_active = false })

    const start_countdown = async () => {
        while (countdown_active && remaining > 0) {
            await checkInterruption()
            
            process.stdout.write(`${up_one_line}${carriage_return}${clear_line}`)
            process.stdout.write(`  ${blue_bold}• ${white}Building app... ${blue}${remaining}s${reset}\n`)
            await sleep(1000)
            remaining--
        }

        if (remaining <= 0 && countdown_active) {
            throw new Error(`Build timed out after ${timeout}s`)
        }
    }

    const countdown_process = start_countdown()

    try {
        await Promise.race([ build_process, countdown_process ])

        process.stdout.write(`${up_one_line}${carriage_return}${clear_line}`)
        process.stdout.write(`  ${green_bold}✔ ${white}Build succeeded${reset}\n`)
    } catch (error) {
        if (global.isSetupInterrupted) process.exit(130)

        countdown_active = false

        if (error.message.includes('timed out')) {
            process.stdout.write(`  ${red_bold}❌ Build timed out after ${timeout}s${reset}\n`)
        } else {
            process.stdout.write(`  ${red_bold}❌ Build failed: ${error.message}${reset}\n`)
        }

        throw error
    }
}


const waitForApp = async (timeout = 30) => {
    process.stdout.write(`  ${blue_bold}•${reset} Waiting for app at localhost:1336...\n`)

    await checkInterruption()
    await execAsync('docker compose -f docker-compose.test.yml up -d')

    for (let i = 0; i < timeout; i++) {
        await checkInterruption()
        
        try {
            await execAsync('curl -f http://localhost:1336')
            process.stdout.write(`${up_one_line}${carriage_return}${clear_line}`)
            process.stdout.write(`  ${green_bold}✔ ${white}App is running on localhost:1336${reset}\n`)
            await sleep(250)
            return true
        } catch (error) {
            if (global.isSetupInterrupted) process.exit(130)

            if (i === timeout - 1) {
                process.stdout.write(`\n  ${red_bold}❌ Timed out waiting for app${reset}\n`)
                throw error
            }

            const remaining = timeout - i - 1
            process.stdout.write(`${up_one_line}${carriage_return}${clear_line}`)
            process.stdout.write(`  ${blue_bold}• ${white}Waiting for app at localhost:1336... ${blue}${remaining}s${reset}\n`)

            await sleep(1000)
        }
    }
}

export default async function globalSetup() {
    try {
        process.stdout.write(`  ${blue_bold}➜ ${white_bold}Starting test containers...`)

        if (process.env.USE_CACHE === 'true') {
            process.stdout.write(` ${grey}(cached build)${reset}\n`)
        } else {
            process.stdout.write(` ${grey}(fresh build)${reset}\n`)
        }

        await removeAnyDeadContainers()

        if (process.env.USE_CACHE !== 'true') await waitForBuild(60)

        await waitForApp(30)

        process.stdout.write(`\n  🧪 ${white_bold}Starting tests...${reset}\n`)
    } catch (error) {
        if (global.isSetupInterrupted) process.exit(130)

        process.stdout.write(`\n  ${red_bold}❌ Test setup failed${reset}\n`)
        process.stdout.write(`     ${error.message}\n`)

        await execAsync('docker compose -f docker-compose.test.yml down').catch(() => {})
        throw error
    }
}
