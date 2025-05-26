import adapter from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'
import autoprefixer from 'autoprefixer'

const sassPrependString = () => {
	const modules = [
		{ path: '_fonts', namespace: 'font' },
		{ path: '_space', namespace: 'space' },
		{ path: '_easing_functions', namespace: 'easing' },
		{ path: '_animations', namespace: 'animation' },
		{ path: '_breakpoints', namespace: 'breakpoint' },
		{ path: '_shared', namespace: 'shared' }
	]

	let prepend_string = '@use "sass:color"\n@use "sass:math"\n'
	modules.forEach(module => prepend_string += `@use "src/lib/css/${module.path}" as ${module.namespace}\n`)
	prepend_string += '@use "src/lib/css/_colors" as *\n'  // colours aren't namespaced, just straight $blue

	return prepend_string
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	},
	preprocess: preprocess({
		sass: {
			prependData: sassPrependString()
		},
		postcss: {
			plugins: [autoprefixer()]
		}
	}),
	onwarn: (warning, handler) => {
		if (warning.code.startsWith('a11y-')) return
		handler(warning)
	}
}

export default config
