import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        resolve: { tsconfigPaths: true },
        plugins: [devtools(), tailwindcss(), tanstackRouter({ target: 'react', autoCodeSplitting: true }), viteReact()],
        optimizeDeps: {
            include: ['lucide-react'],
        },
        server: {
            proxy: {
                '/api': {
                    target: env.VITE_APP_SERVER || 'http://spark.kodevio.com:8000',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    }
})
