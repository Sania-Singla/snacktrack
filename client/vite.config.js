import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config({ path: './src/Config/.env' }); // path to .env (no need if in root directory) to use import.meta.env

export default defineConfig(({ mode }) => {
    // Load environment variables from `src/Config/.env` because import is not defined in vite.config.js itself
    const env = loadEnv(mode, process.cwd() + '/src/Config', '');

    return {
        plugins: [react(), tailwindcss()],
        server: {
            proxy: {
                '/api': {
                    target: env.VITE_BACKEND_URL,
                    changeOrigin: true,
                    secure: false, // Set to true if using HTTPS
                },
            },
        },
    };
});
