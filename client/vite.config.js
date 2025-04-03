import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

// path to .env (no need if in root directory) to use import.meta.env
dotenv.config({ path: './src/Config/.env' });

// Proxy doesn't work in production
export default defineConfig(() => {
    return { plugins: [react(), tailwindcss()] };
});
