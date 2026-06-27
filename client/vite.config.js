import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
    return {
        server: {
            port: 5173,
        },
        plugins: [react(), tailwindcss()],
    };
});
