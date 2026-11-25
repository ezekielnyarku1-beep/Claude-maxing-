import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import { isPasswordResetConfigured, mailer } from './password-reset-mailer.mjs'

const databaseUrl = process.env.DATABASE_URL
const secret = process.env.BETTER_AUTH_SECRET
const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:5173'
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set in the environment.')
}

if (!secret || secret.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be set to at least 32 characters.')
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 5,
})

pool.on('error', error => {
  console.error('Unexpected Postgres pool error:', error.message)
})

export const auth = betterAuth({
  database: pool,
  baseURL,
  secret,
  trustedOrigins: [...new Set([baseURL, process.env.APP_ORIGIN].filter(Boolean))],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!mailer) {
        throw new Error('Password reset email is not configured. Set the SMTP variables.')
      }

      void mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Reset your Overview Teams password',
        text: `Use this link to reset your password: ${url}`,
      }).catch(error => {
        console.error('Failed to send password reset email:', error.message)
      })
    },
  },
})
