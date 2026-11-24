# Overview Teams

A web app for tracking project work: teams, issues, projects and progress.

## Folders

- `client` is the website people use (React and Vite).
- `server` is the backend (Node.js, Express and Prisma on Neon Postgres).

## First-time setup

You need Node.js 22.18 or newer.

1. In `server`, copy `.env.example` to `.env` and `.env.test.example` to `.env.test`, and fill in the Neon connection details and the Neon Auth URL. `.env` uses the `pm_app` database and `.env.test` uses `pm_app_test`.
2. In `server`, run `npm install`, then `npm run db:migrate`, `npm run db:seed` and `npm run test:db:setup`.
3. In `client`, copy `.env.example` to `.env`, fill in the same Neon Auth URL, then run `npm install`.

## Accounts and admins

- Anyone can create an account on the sign-in page. A new account is a Member and is in no teams.
- To make someone an admin, they sign in once, then you run this in `server`: `npm run make-admin -- their@email.com`.
- Login, password reset and blocking repeated wrong passwords are handled by Neon Auth.

## Run the app

Open two terminals.

1. In `server`, run `npm run dev`. The server starts on http://localhost:4000.
2. In `client`, run `npm run dev`, then open http://localhost:5173.

## Database commands (in `server`)

- `npm run db:migrate` after changing `prisma/schema.prisma`.
- `npm run db:seed` adds sample data to an empty database.
- `npm run db:reset` wipes the database and rebuilds the tables. Run `npm run db:seed` after it.

## Checks

- In `server`: `npm test` and `npm run lint`. Tests run on the `pm_app_test` database only.
- In `client`: `npm run build` and `npm run lint`.

## Keyboard shortcuts

- `C` creates an issue.
- `Ctrl K` opens the command menu.
- `Escape` closes panels, menus and dialogs.
- Arrow keys move through issue lists.
