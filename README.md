# 🔄 SkillSwap - Peer-to-Peer Skill Exchange 

SkillSwap is a modern full-stack web application designed to help people learn new things by trading their existing expertise. No money involved—just pure skill bartering. If you know Python and want to learn Graphic Design, SkillSwap helps you find the perfect mutual match!

## ✨ Core Features
- 🤝 **Pure Barter System:** Users list "Skills I Offer" and "Skills I Want". The platform facilitates 1-to-1 trades.
- 🔍 **Smart Mutual Matching:** The *Explore* feed highlights users who offer what you want **and** want what you offer.
- 💬 **Real-time Messaging:** Integrated live chat via Socket.IO so users can easily organize their knowledge-sharing sessions.
- ⭐ **Reviews & Ratings:** After an exchange is marked 'Completed', both parties can leave a 1-5 star review calculating aggregate user trust scores.
- 👥 **Social Network:** Follow your favorite educators, see their subscriber count, and stay updated on their new skills.
- 🎨 **Modern UI/UX:** Built with Next.js 16, Tailwind CSS, shadcn/ui components, and Framer Motion for beautiful page transitions.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `framer-motion`
- **Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Real-time:** Socket.IO
- **Security:** JWT Authentication, Helmet, Rate Limiting, bcryptjs

## 🚀 Local Development Setup

To run this application locally, you will need **Node.js (>= 18)** and **MongoDB** installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Eshwar0745/Skill-Swap-10.git
cd Skill-Swap-10
```

### 2. Configure Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_super_secret_key
FRONTEND_URLS=http://localhost:3000
```
Start the backend server:
```bash
npm run dev
```

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
pnpm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```
Start the frontend development server:
```bash
pnpm dev
```

Visit **http://localhost:3000** to view the app!

## 🌍 Production Deployment

This application is ready for free-tier cloud deployment:
1. **Database:** Deploy your MongoDB cluster using **MongoDB Atlas**.
2. **Backend:** Deploy the `backend` folder to **Render**, providing the `MONGO_URI` from Atlas.
3. **Frontend:** Deploy the `frontend` folder via **Vercel**, securely providing the Render URL as the `NEXT_PUBLIC_API_BASE`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check out the [issues page](https://github.com/Eshwar0745/Skill-Swap-10/issues).

## 📄 License
This project is licensed under the MIT License.




