import { spawn } from 'node:child_process'

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED is required to run schema migrations.')
}

const command = process.platform === 'win32'
  ? (process.env.ComSpec ?? 'cmd.exe')
  : 'npx'
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npx --yes auth@latest migrate --config server/auth.mjs --yes']
  : ['--yes', 'auth@latest', 'migrate', '--config', 'server/auth.mjs', '--yes']

const migration = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL_UNPOOLED,
  },
})

migration.once('error', error => {
  console.error('Failed to start Better Auth migrations:', error.message)
  process.exitCode = 1
})

migration.once('exit', code => {
  process.exitCode = code ?? 1
})
