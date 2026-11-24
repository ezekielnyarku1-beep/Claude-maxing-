import { spawn } from 'node:child_process'

const children = [
  spawn(process.execPath, ['server.mjs'], { stdio: 'inherit' }),
  spawn(process.execPath, [
    'node_modules/vite/bin/vite.js',
    '--host',
    '127.0.0.1',
    '--port',
    '5175',
  ], { stdio: 'inherit' }),
]

let stopping = false

function stopChildren() {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null) child.kill()
  }
}

for (const child of children) {
  child.once('error', error => {
    console.error('Failed to start the app server:', error.message)
    process.exitCode = 1
    stopChildren()
  })
  child.once('exit', code => {
    if (!stopping) {
      process.exitCode = code ?? 1
      stopChildren()
    }
  })
}

process.once('SIGINT', stopChildren)
process.once('SIGTERM', stopChildren)
