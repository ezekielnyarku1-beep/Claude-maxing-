import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const vendorGroups = [
  ['auth', /node_modules[\\/](@neon|better-auth|@better-auth|better-call|jose|nanostores|@better-fetch)/],
  ['react', /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/],
  ['data', /node_modules[\\/](@tanstack|@dnd-kit)/],
]

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks: id => vendorGroups.find(([, pattern]) => pattern.test(id))?.[0],
      },
    },
  },
})
