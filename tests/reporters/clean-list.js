import { white, grey, green, red, yellow, white_bold, blue_bold, green_bold, red_bold, yellow_bold, reset, up_one_line, carriage_return, clear_line } from '../helpers/terminal-output'

const padded = (number, num_columns) => {
    const padding = ' '.repeat(num_columns - number.toString().length)
    return `${padding}${number}`
}

class CleanListReporter {
    constructor() {
        this.test_indexes  = new Map()
        this.test_counter  = 0
        this.lines_written = 0
        this.passed        = 0
        this.failed        = 0
        this.skipped       = 0
    }

    onBegin(config, suite) {
        process.stdout.write(`\n  ${grey}Running ${white}${suite.allTests().length} ${grey}tests using ${white}${config.workers} ${grey}workers${reset}\n\n`)
    }

    async onTestBegin(test) {
        this.test_indexes.set(test.id, this.test_counter)
        this.test_counter++

        const test_number = this.test_counter,
              suite_title = test.parent.title,
              test_title  = test.title

        // aesthetic micro-delay between tests
        await new Promise(resolve => setTimeout(resolve, 50))

        process.stdout.write(`  ${blue_bold}➜ ${grey}${test_number} ${blue_bold}› ${grey}${suite_title} ${blue_bold}› ${grey}${test_title}${reset}\n`)
        this.lines_written++
    }

    onTestEnd(test, result) {
        const test_index  = this.test_indexes.get(test.id),
              test_number = test_index + 1,
              suite_title = test.parent.title,
              test_title  = test.title,
              duration    = (result.duration / 1000).toFixed(2) + 's'
        
        let status_icon,
            status_color,
            text_color

        if (result.status === 'passed') {
            this.passed++
            status_icon  = '✔'
            status_color = green_bold
            text_color   = white
        } else if (result.status === 'failed' || result.status === 'timedOut') {
            this.failed++
            status_icon  = '✗'
            status_color = red_bold
            text_color   = red
        } else if (result.status === 'skipped') {
            this.skipped++
            status_icon  = '•'
            status_color = yellow_bold
            text_color   = grey
        } else {
            this.failed++
            status_icon  = '?'
            status_color = yellow_bold
            text_color   = yellow
        }

        const lines_to_go_up = this.lines_written - test_index
        process.stdout.write(`\x1b[${lines_to_go_up}A`)
        process.stdout.write(`${carriage_return}${clear_line}`)
        process.stdout.write(`  ${status_color}${status_icon} ${grey}${test_number} ${status_color}› ${text_color}${suite_title} ${status_color}› ${text_color}${test_title} ${status_color}${duration}${reset}`)
        // move back down
        process.stdout.write(`\x1b[${lines_to_go_up}B`)
        process.stdout.write(`${carriage_return}`)
    }

    async onEnd(result) {
        const duration = ((Date.now() - result.startTime) / 1000).toFixed(2) + 's'

        let line_color  = result.status === 'passed' ? green : red,
            num_columns = Math.max(this.passed, this.failed, this.skipped).toString().length

        process.stdout.write(`\n${line_color}————————————————————————————————————————————${reset}\n`)
        if (result.status === 'passed') {
            process.stdout.write(`\n  ${green_bold}${this.success_message()}${reset}\n`)
            process.stdout.write(`\n      ${white_bold}All tests passed${reset}\n`)
            process.stdout.write(`      ${white}Ran for ${duration}${reset}\n`)
        } else if (result.status === 'timedout') {
            process.stdout.write(`\n  ${red_bold}❌ Timed out${reset}\n`)
            process.stdout.write(`     ${white}Ran for ${duration}${reset}\n`)
            process.stdout.write(`\n  ${red_bold}✗ ${red}${this.failed} failed${reset}\n`)
            process.stdout.write(`  ${green_bold}✔ ${green}${this.passed} passed${reset}\n`)
            if (this.skipped > 0) {
                process.stdout.write(`  ${white_bold}• ${white}${this.skipped} skipped${reset}\n`)
            }
        } else if (result.status === 'interrupted') {
            process.stdout.write(`\n  ${yellow_bold}⚠️ Interrupted by user${reset}\n`)
            process.stdout.write(`     ${white}Ran for ${duration}${reset}\n`)
            process.stdout.write(`\n  ${red_bold}✗ ${red}${this.failed} failed${reset}\n`)
            process.stdout.write(`  ${green_bold}✔ ${green}${this.passed} passed${reset}\n`)
            if (this.skipped > 0) {
                process.stdout.write(`  ${white_bold}• ${white}${this.skipped} skipped${reset}\n`)
            }
        } else {
            process.stdout.write(`\n  ${red_bold}${this.fail_message()}${reset}\n`)
            process.stdout.write(`\n     ${red_bold}${padded(this.failed, num_columns)} ${white_bold}failed${reset}\n`)
            process.stdout.write(`     ${green_bold}${padded(this.passed, num_columns)} ${white_bold}passed${reset}\n`)
            if (this.skipped > 0) {
                process.stdout.write(`     ${white_bold}• ${white_bold}${padded(this.skipped, num_columns)} ${white_bold}skipped${reset}\n`)
            }
            process.stdout.write(`\n     ${white}Ran for ${duration}${reset}\n`)
        }
        process.stdout.write(`\n${line_color}————————————————————————————————————————————${reset}\n`)

        if (result.status !== 'passed') {
            await new Promise(resolve => setTimeout(resolve, 500))
        }
    }

    // tell Playwright that this reporter handles terminal output
    // in order to prevent Playwright from printing its big ugly
    // report, which isn't needed and gets in the way.
    printsToStdio() {
        return true
    }

    success_message() {
        const messages = [
            '🇰🇿  Great success.',
            '😎  Never in doubt.',
            '💯  Flawless victory.',
            '🏆  Championship performance.',
            '🏅  Tremendous performance.',
            '🎯  Bullseye.',
            '👍  Easy.',
            '🤙  Bruh.',
            '🔥  Fire.',
            '🤘  Too easy.',
            '👊  Nailed it.',
            '🚀  Ship it.',
            '🎩  Magic.',
            '⚽️  Liquid football.',
            '🥇  Medal performance.',
            '🫵  You’re the best.',
            '🪄  You’re a wizard, Harry.',
            '👑  Crowning achievement.',
            '🏆  This is a triumph.',
            '🏆  I’d like to thank the academy.'
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }

    fail_message() {
        const messages = [
            '❌ No.',
            '❌ Nope.',
            '❌ Nope, it’s fucked.',
            '❌ Nope, fucked it.',
            '❌ Shit.',
            '❌ Fuck.',
            '❌ Shitfuck.',
            '❌ Catastrophic fail.',
            '❌ Epic fail.',
            '❌ Total failure.',
            '❌ Whoa nelly.',
            '❌ You lose.',
            '❌ Why did you do that?',
            '❌ You broke everything.',
            '❌ You just accidentally the whole thing.'
        ]
        return messages[Math.floor(Math.random() * messages.length)]
    }
}

export default CleanListReporter
