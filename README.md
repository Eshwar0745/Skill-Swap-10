# SkillSwap – Peer-to-Peer Skill Exchange Platform

SkillSwap is a full-stack web application that enables users to exchange skills without money. Learn what you want by teaching what you know!


📁 Project Structure
skillswap/
├── backend/          # Express API server
│   ├── config/       # Database, Redis, CORS
│   ├── controllers/  # Business logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   └── server.js     # Entry point
│
└── frontend/         # Next.js app
    ├── app/          # App router pages
    ├── components/   # UI components
    └── lib/          # API client & utils


## ⚙️ Features

- **Authentication** – JWT-based auth with refresh tokens
- **Skill Management** – Offer skills you can teach, request skills you want to learn
- **Exchange System** – Request swaps, accept/decline, mark as complete
- **Real-time Messaging** – Socket.IO powered instant chat
- **Reviews & Ratings** – Rate users after skill exchanges
- **Smart Search** – Full-text search with category and location filters
- **Redis Caching** – Fast response times with intelligent cache invalidation
- **Notifications** – In-app notifications for exchange requests

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Tech Stack](#tech-stack)

## Prerequisites

- Node.js (v18+)
- MongoDB (v8.0+)
- pnpm
- Redis (optional, for caching)

## Installation

```bash
git clone https://github.com/yourusername/skillswap.git
cd skillswap

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
pnpm install


Running the App
Make sure MongoDB is running:

Then start the services:




