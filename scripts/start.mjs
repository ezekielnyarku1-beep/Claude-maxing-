import { existsSync } from 'node:fs'

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

process.argv.push('--production')
await import('../server.mjs')
