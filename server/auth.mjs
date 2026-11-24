import { betterAuth } from 'better-auth'
import nodemailer from 'nodemailer'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL
const secret = process.env.BETTER_AUTH_SECRET
const baseURL = process.env.BETTER_AUTH_URL ?? 'http://127.0.0.1:5175'
const smtpPort = Number(process.env.SMTP_PORT ?? 587)
const mailer = process.env.SMTP_HOST && process.env.SMTP_USER
  && process.env.SMTP_PASSWORD && process.env.SMTP_FROM
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null

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

      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Reset your Overview Teams password',
        text: `Use this link to reset your password: ${url}`,
      })
    },
  },
})
