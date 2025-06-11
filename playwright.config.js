import { devices } from '@playwright/test'

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	globalSetup:    './tests/system-test/global-setup.js',
	globalTeardown: './tests/system-test/global-teardown.js',
	use: {
		baseURL:    'http://localhost:1336',
		screenshot: 'only-on-failure',
		video:      'retain-on-failure'
	},
	retries:    process.env.CI ? 2: 0,
	workers:    1, // process.env.CI ? 1: undefined,
	forbidOnly: !!process.env.CI,
	projects: [
		{
			name: 'chromium',
			use: { 
				...devices['Desktop Chrome'],
				viewport: { width: 1920, height: 1080 }
			}
		}
	],
	testDir:   'tests/system-test',
	testMatch: /(.+\.)?test\.[jt]s/,
	timeout:   30 * 1000,
	expect: {
		timeout: 5000
	},
	outputDir: 'tests/output/playwright',
	reporter: [
		['./tests/reporters/clean-list.js'],
		['html', { 
			open:         'on-failure',
			outputFolder: 'tests/output/html_report',
			port:         9323
		}]
	]
}

if (process.env.ALL_BROWSERS) {
	config.projects = [
		{
			name: 'chromium',
			use:  { 
				browserName: 'chromium',
				viewport:    { width: 1920, height: 1080 }
			}
		},
		{
			name: 'firefox',
			use:  { 
				browserName: 'firefox',
				viewport:    { width: 1920, height: 1080 }
			}
		},
		{
			name: 'webkit',
			use:  { 
				browserName: 'webkit',
				viewport:    { width: 1920, height: 1080 }
			}
		}
	]
}

export default config
