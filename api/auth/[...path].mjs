const requiredEnvironment = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
]

export default {
  async fetch(request) {
    const missing = requiredEnvironment.filter(name => !process.env[name])
    if (missing.length > 0) {
      return Response.json(
        { error: `Missing server environment variables: ${missing.join(', ')}` },
        { status: 503 },
      )
    }

    const { auth, isPasswordResetConfigured } = await import('../../server/auth.mjs')
    const { pathname } = new URL(request.url)

    if (pathname === '/api/auth/request-password-reset'
      && request.method === 'POST'
      && !isPasswordResetConfigured) {
      return Response.json(
        { error: 'Password reset email is not configured.' },
        { status: 503 },
      )
    }

    return auth.handler(request)
  },
}
