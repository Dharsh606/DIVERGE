import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:8080',
				changeOrigin: true
			}
		}
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: undefined
			},
			alias: {
				'$lib': 'src/lib',
				'$lib/*': 'src/lib/*'
			},
			adapter: adapter()
		})
	]
});
