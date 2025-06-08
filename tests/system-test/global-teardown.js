import { exec } from 'child_process'
import { promisify } from 'util'
import { white, white_bold, blue_bold, green_bold, red_bold, reset, up_one_line, carriage_return, clear_line } from '../helpers/terminal-output'
import { checkInterruption, sleep } from '../helpers/tools'

const execAsync = promisify(exec)

export default async function globalTeardown() {
    await checkInterruption()

    // if `npm run test` was called directly, we need to clean up
    // if `./test` was run, the test script will handle cleanup

    // It's better to run ./test so you don't have to wait for docker to
    // finish removing containers before reviewing the html report

    if (process.env.WAS_RUN_VIA_TEST_SCRIPT === 'true') {
        return
    } else {
        process.stdout.write(`\n  🏁 ${white_bold}Cleaning up...${reset}\n`)
    
        try {
            process.stdout.write(`  ${blue_bold}•${reset} Removing test containers...\n`)
            await execAsync('docker compose -f docker-compose.test.yml down')
            process.stdout.write(`${up_one_line}${carriage_return}${clear_line}`)
            process.stdout.write(`  ${green_bold}✔ ${white}Test containers removed${reset}\n`)
            await sleep(250)
        } catch (error) {
            process.stdout.write(`\n  ${red_bold}❌ Cleanup failed${reset}\n`)
            process.stdout.write(`     ${error.message}\n`)
        }
    }
}
