# AI Manager Backend

Backend API server for the AI Manager platform.

Built with Node.js, Express, and MongoDB.

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- Socket.IO
- node-cron

## Project Path

Folder name in this repository:

`aimanager_backend`

## Prerequisites

- Node.js 18+ (recommended Node.js 20)
- npm 9+
- MongoDB (local or cloud)

## Environment Variables

Create a `.env` file inside this folder:

```env
MONGODB_URI=mongodb://localhost:27017/aimanager
PORT=5001
```

Notes:

- `PORT` is optional (defaults to `5001`).
- `MONGODB_URI` is required.

## Install

```bash
npm install
```

## Run (Development/Local)

```bash
npm start
```

Default API URL:

`http://localhost:5001`

Health check endpoint:

`GET /api/health`

## Scripts

- `npm start` - start the backend server
- `npm test` - placeholder test script
- `npm run build` - placeholder script (no build step required)

## Core API Areas

Mounted in `server.js`:

- `/api` - events
- `/api/users` - user auth/profile
- `/api/schedule` - chapter schedule
- `/api/questions` - question bank
- `/api/maths` - maths content
- `/api/physics` - physics content
- `/api/physicalchem` - physical chemistry content
- `/api/quiz` - quizzes and attempts
- `/api/analytics` - analytics data
- `/api/sessions` - study sessions
- `/api/goals` - study goals
- `/api/submissions` - exam submissions/review
- `/api/teacher` - teacher control center APIs
- `/api/announcements` - announcements
- `/api/holidays` - holiday requests

## Docker (Backend only)

From this folder:

```bash
docker build -t aimanager-backend .
docker run --env-file .env -p 5001:5001 aimanager-backend
```

## Run With Full Platform (Recommended)

From repository root:

```bash
docker compose up --build -d
```

Then open:

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

## Project Structure

- `api/` - route handlers
- `model/` - Mongoose models
- `server.js` - app entry point and route mounting
