import { isPasswordResetConfigured } from '../server/password-reset-mailer.mjs'

export function GET() {
  return Response.json({ passwordResetEnabled: isPasswordResetConfigured })
}
