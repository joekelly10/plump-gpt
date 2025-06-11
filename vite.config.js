import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'$tests': path.resolve('./tests')
		}
	},
	server: {
		port: 1337,
		strictPort: true
	},
	preview: {
		port: 1337,
		strictPort: true
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
})
