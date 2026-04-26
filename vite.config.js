import { defineConfig } from 'vite'

export default defineConfig({
  // ... your existing config (like plugins)
  preview: {
    allowedHosts: ['song-ui-2.onrender.com']
  }
})