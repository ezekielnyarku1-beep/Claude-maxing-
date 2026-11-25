import { auth, isPasswordResetConfigured } from '../server/auth.mjs'

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url)

    if (pathname === '/api/app-config' && request.method === 'GET') {
      return Response.json({ passwordResetEnabled: isPasswordResetConfigured })
    }

    if (
      pathname === '/api/auth/request-password-reset'
      && request.method === 'POST'
      && !isPasswordResetConfigured
    ) {
      return Response.json(
        { error: 'Password reset email is not configured.' },
        { status: 503 },
      )
    }

    if (pathname.startsWith('/api/auth/')) {
      return auth.handler(request)
    }

    return Response.json({ error: 'Not found.' }, { status: 404 })
  },
}
