import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config({ path: './src/Config/.env' });

export default defineConfig(() => {
    return { plugins: [react(), tailwindcss()] };
});
