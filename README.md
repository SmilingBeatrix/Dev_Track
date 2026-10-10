# DevTrack — MERN Developer Productivity Platform

A full-stack starter project for managing projects, tasks, deadlines, and productivity.

## Features
- JWT registration and login; bcrypt password hashing
- Protected React routes and authenticated REST API
- Project CRUD and project progress calculation
- Task CRUD, status, priority, due dates, and search/filter
- Dashboard metrics and recent tasks
- Responsive UI with dark sidebar and charts
- Per-user data ownership checks

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Run locally

### 1. Backend
```bash
cd server
cp .env.example .env
# Set MONGODB_URI and JWT_SECRET in .env
npm install
npm run dev
```
Backend defaults to http://localhost:5000.

### 2. Frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173).

Register an account to start. The app creates projects and tasks through the API.

## Environment variables
`server/.env`
- `PORT=5000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/devtrack`
- `JWT_SECRET=replace-with-a-long-random-secret`
- `CLIENT_URL=http://localhost:5173`

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/projects`
- `GET/PATCH/DELETE /api/projects/:id`
- `GET/POST /api/tasks`
- `GET/PATCH/DELETE /api/tasks/:id`
- `GET /api/dashboard`

## Before production
Add email verification, password reset, rate limiting, request validation, audit logging, refresh-token/session management, automated tests, and deployment secrets. Do not commit `.env`.
