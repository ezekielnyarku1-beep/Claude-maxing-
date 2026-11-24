import { createAuthClient } from 'better-auth/react'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

const authClient = createAuthClient()

function unwrap(result) {
  if (result.error) {
    throw new ApiError(result.error.message, result.error.status)
  }
  return result.data
}

export async function api(path, body) {
  try {
    switch (path) {
      case 'me': {
        const session = unwrap(await authClient.getSession())
        return { user: session?.user ?? null }
      }
      case 'login': {
        const result = unwrap(await authClient.signIn.email(body))
        return { user: result.user }
      }
      case 'register': {
        const result = unwrap(await authClient.signUp.email(body))
        return { user: result.user }
      }
      case 'logout':
        unwrap(await authClient.signOut())
        return {}
      case 'forgot-password': {
        const configResponse = await fetch('/api/app-config')
        if (!configResponse.ok) {
          throw new ApiError('Unable to check password-reset availability.', configResponse.status)
        }
        const config = await configResponse.json()
        if (!config.passwordResetEnabled) {
          throw new ApiError('Password reset email is not configured. Set the SMTP variables.', 503)
        }
        unwrap(await authClient.requestPasswordReset({
          email: body.email,
          redirectTo: `${window.location.origin}/reset-password`,
        }))
        return { message: 'If that email is registered, reset instructions have been sent.' }
      }
      case 'reset-password':
        unwrap(await authClient.resetPassword({
          token: body.token,
          newPassword: body.password,
        }))
        return { message: 'Your password has been updated. You can now log in.' }
      default:
        throw new ApiError('Unknown authentication action.', 404)
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (path === 'login') throw new ApiError('Email or password is incorrect.', error.status)
      if (path === 'register' && error.status === 422) {
        throw new ApiError('An account with that email may already exist.', error.status)
      }
      if (path === 'forgot-password' && error.status >= 500) {
        throw new ApiError('Password reset email is unavailable. Configure SMTP and try again.', error.status)
      }
      throw error
    }

    throw new ApiError("Can't reach the server. Check your connection and try again.", 0)
  }
}
