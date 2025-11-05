# SkillSwap Backend

Node.js + Express + MongoDB backend for SkillSwap.

## Features

- JWT authentication (register/login/me)
- Short-lived access tokens + httpOnly refresh cookies (refresh, logout)
- CRUD for Offered and Requested skills
- Messaging between users (REST + optional real-time with Socket.IO)
- Reviews and ratings with automatic average rating on users
- Exchanges linking users and skills with status updates
- MongoDB Atlas via Mongoose
- CORS configured for Vercel frontend (supports multiple origins)
- dotenv for environment variables
- bcrypt for password hashing
- Helmet, compression, rate-limiting, validators

## API Base

All endpoints are prefixed with `/api` (e.g., `/api/auth/login`). Responses are JSON.

## Setup

1. Create a `.env` file from `.env.example` and fill values.
2. Install dependencies.
3. Start the server.

### Commands (Windows cmd)

```cmd
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:%PORT%` (default 4000).

## Env Vars

- `MONGO_URI`: MongoDB Atlas connection string
- `MONGO_DB`: Optional database name
- `JWT_SECRET`: Strong secret for signing access tokens
- `JWT_REFRESH_SECRET`: Strong secret for signing refresh tokens
- `ACCESS_TOKEN_TTL`: e.g., `15m`
- `REFRESH_TOKEN_TTL`: e.g., `30d`
- `FRONTEND_URLS`: Comma-separated list of frontend origins (CORS)
- `PORT`: Port to run server
- `COOKIE_SECURE`: `true` on HTTPS (Vercel) so cookies use SameSite=None; `false` locally
- `COOKIE_DOMAIN`: Optional cookie domain for prod (e.g., `.yourdomain.com`)

## Socket.IO (optional)

On the client, after login, connect and emit your user id to receive real-time messages:

```js
import { io } from 'socket.io-client';
// Pass your short-lived access token for auth
const socket = io(API_BASE_URL, { withCredentials: true, auth: { token } });
socket.on('message:new', (msg) => {
  // Update your thread UI
});
```

REST messaging works without Socket.IO.

## Endpoints

- Auth
  - POST `/api/auth/register` { name, email, password }
  - POST `/api/auth/login` { email, password }
  - GET `/api/auth/me` (Bearer token)
  - POST `/api/auth/refresh` (httpOnly cookie)
  - POST `/api/auth/logout` (Bearer token) — clears cookie and revokes refresh tokens

- Offered Skills
  - GET `/api/offered-skills` (query: page, limit, q, userId, category)
  - GET `/api/offered-skills/:id`
  - POST `/api/offered-skills` (auth)
  - PUT `/api/offered-skills/:id` (auth, owner)
  - DELETE `/api/offered-skills/:id` (auth, owner)

- Requested Skills
  - GET `/api/requested-skills` (query: page, limit, q, userId, category)
  - GET `/api/requested-skills/:id`
  - POST `/api/requested-skills` (auth)
  - PUT `/api/requested-skills/:id` (auth, owner)
  - DELETE `/api/requested-skills/:id` (auth, owner)

- Messages
  - POST `/api/messages` { recipientId, content } (auth)
  - GET `/api/messages/thread/:userId` (auth)
  - POST `/api/messages/thread/:userId/read` (auth)
  - GET `/api/messages/unread-count` (auth)
- Exchanges
  - POST `/api/exchanges` { providerId?, offeredSkillId?, requestedSkillId?, scheduledAt?, notes? } (auth)
  - GET `/api/exchanges?role=all|requester|provider&status=` (auth)
  - GET `/api/exchanges/:id` (auth, participant only)
  - PUT `/api/exchanges/:id` { status?, scheduledAt?, notes? } (auth, participant only)

- Reviews
  - POST `/api/reviews` { revieweeId, rating, comment?, context?, skillId? } (auth)
  - GET `/api/reviews/user/:userId` (query: page, limit)
  - PUT `/api/reviews/:id` (auth, reviewer only)
  - DELETE `/api/reviews/:id` (auth, reviewer only)

## Typical Fetch Calls

```js
// Register
await fetch(`${API}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password })
});

// Login -> token
const { token, user } = await fetch(`${API}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}).then(r => r.json());

// Authorized fetch
await fetch(`${API}/api/offered-skills`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Refresh access token when 401 due to expiry
const refreshed = await fetch(`${API}/api/auth/refresh`, { method: 'POST', credentials: 'include' }).then(r => r.json());
const newToken = refreshed.token;
```

## Notes

- Ensure `FRONTEND_URL` matches your deployed Vercel app origin for CORS.
- For production, set strong `JWT_SECRET` and use a dedicated MongoDB user.