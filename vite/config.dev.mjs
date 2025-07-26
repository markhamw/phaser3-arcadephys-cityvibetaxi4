import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    server: {
        port: 8080,
        allowedHosts: [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '192.168.1.151',
            '9e785c8ba63f.ngrok-free.app',
            '.ngrok-free.app',
            '.ngrok.io',
            'all'
        ]
    }
});
