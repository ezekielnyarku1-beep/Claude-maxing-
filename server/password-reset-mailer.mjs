import nodemailer from 'nodemailer'

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

export const isPasswordResetConfigured = Boolean(mailer)
export { mailer }
