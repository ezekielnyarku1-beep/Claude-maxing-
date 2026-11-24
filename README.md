# Overview Teams

Overview Teams uses React/Vite for the UI, Better Auth for email/password authentication, and Neon Postgres for users and sessions. Postgres is accessed only by the Node server; the browser talks to the same-origin auth endpoints.

## Local setup

1. Install Node.js 20.19+ and run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `DATABASE_URL` to Neon's pooled connection string and `DATABASE_URL_UNPOOLED` to its direct connection string. Set a random `BETTER_AUTH_SECRET` with at least 32 characters.
4. Run `npm run db:migrate` to create or update Better Auth tables.
5. Run `npm run dev` and open `http://127.0.0.1:5175`.

The migration command uses the direct URL; the running app uses the pooled URL. Password-reset emails require SMTP settings in `.env.local`. The UI reports an error if SMTP is not configured rather than claiming an email was sent.

## Production

Run `npm run build`, then provide the environment variables from `.env.example` and run `npm start`. The production server serves the built UI and Better Auth API from one origin. Set `BETTER_AUTH_URL` and `APP_ORIGIN` to the public HTTPS origin before deployment.
