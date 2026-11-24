# Overview Teams

A web app for tracking project work: teams, issues, projects and progress.

## Folders

- `client` is the website people use (React and Vite).
- `server` is the backend (Node.js and Express).

## First-time setup

You need Node.js 22.9 or newer.

1. In `server`, copy `.env.example` to `.env`, then run `npm install`.
2. In `client`, copy `.env.example` to `.env`, then run `npm install`.

## Run the app

Open two terminals.

1. In `server`, run `npm run dev`. The server starts on http://localhost:4000.
2. In `client`, run `npm run dev`, then open http://localhost:5173.

## Checks

- In `server`: `npm test` and `npm run lint`.
- In `client`: `npm run build` and `npm run lint`.
