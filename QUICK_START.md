# 🚀 SkillSwap - Quick Start Guide

## Complete Feature Summary

✅ **Skill Exchange Requests** - Request swaps, accept/decline, mark complete  
✅ **Messaging System** - Real-time chat between users  
✅ **Review & Rating** - Leave reviews after exchanges, auto-update user ratings  
✅ **All features are WORKING and integrated with MongoDB**

---

## 🎯 Start the Application

### 1. Start MongoDB (if not running)
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

### 2. Start Backend Server
```bash
cd E:\Skill-Share-01\backend
node server.js
```

**You should see:**
```
✅ Connected to MongoDB
Server running on port 4000
```

### 3. Start Frontend (in new terminal)
```bash
cd E:\Skill-Share-01\frontend
pnpm dev
```

**You should see:**
```
▲ Next.js 16.0.0
- Local: http://localhost:3000
```

---

## 🧪 Test Complete Flow

### Test 1: Skill Exchange Request Flow

**Step 1: Create Two Users**
1. Open http://localhost:3000
2. Click **"Sign Up"**
3. Create User A: 
   - Name: Alice
   - Email: alice@test.com
   - Password: password123
4. Logout (top right)
5. Create User B:
   - Name: Bob
   - Email: bob@test.com
   - Password: password123

**Step 2: Add Skills**
1. Login as Alice
2. Go to **Profile**
3. Click **"Add Skill"** under "Skills I Offer"
4. Add: "Python Programming", Category: "Programming"
5. Logout

6. Login as Bob
7. Go to **Profile**
8. Click **"Add Skill"** under "Skills I Want to Learn"
9. Add: "Python", Category: "Programming"

**Step 3: Request Swap**
1. As Bob, go to **Explore**
2. Find Alice's "Python Programming" skill
3. Click **"Request Swap"** button
4. ✅ Exchange request created!
5. Check **Exchanges** page → see your outgoing request

**Step 4: Accept Request**
1. Logout, login as Alice
2. Go to **Exchanges** page
3. See Bob's pending request
4. Click **"Accept"** button
5. ✅ Status changes to "Accepted"

**Step 5: Message**
1. Click **"Message"** button on the exchange
2. Opens chat with Bob
3. Type: "Hi Bob, when would you like to start learning Python?"
4. Click **"Send"**
5. ✅ Message sent and stored in MongoDB

6. Logout, login as Bob
7. Go to **Exchanges**, click **"Message"**
8. See Alice's message
9. Reply: "How about tomorrow at 3pm?"
10. ✅ Real-time messaging working!

**Step 6: Complete Exchange**
1. As Alice or Bob, go to **Exchanges**
2. Find the accepted exchange
3. Click **"Mark Complete"**
4. ✅ Status changes to "Completed"

**Step 7: Leave Review**
1. Click **"Leave Review"** button
2. Select 5 stars ⭐⭐⭐⭐⭐
3. Write: "Great teacher! Very patient and clear explanations."
4. Click **"Submit Review"**
5. ✅ Review saved to MongoDB

6. Go to Alice's profile (or Bob's profile if reverse)
7. ✅ See rating updated to 5.0 (1 review)

---

## 📋 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Skills
- `GET /api/offered-skills` - List offered skills
- `POST /api/offered-skills` - Create offered skill
- `PUT /api/offered-skills/:id` - Update offered skill
- `DELETE /api/offered-skills/:id` - Delete offered skill
- `GET /api/requested-skills` - List requested skills
- `POST /api/requested-skills` - Create requested skill

### Exchanges (Swap Requests)
- `POST /api/exchanges` - Create exchange request
- `GET /api/exchanges` - List my exchanges
- `GET /api/exchanges/:id` - Get exchange details
- `PATCH /api/exchanges/:id/status` - Update status (accept/decline/complete)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/thread?userId=xxx` - Get conversation
- `PATCH /api/messages/mark-read` - Mark messages as read
- `GET /api/messages/unread-count` - Get unread count

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:userId` - Get user's reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Categories
- `GET /api/categories` - Get predefined categories

---

## 🎨 Frontend Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page |
| Explore | `/explore` | Browse skills, filter, search |
| Exchanges | `/exchanges` | Manage swap requests |
| Messages | `/messages?userId=xxx` | Chat with user |
| Profile | `/profile` | Your skills and reviews |
| Create Review | `/reviews/create?userId=xxx` | Leave review |
| Login | `/login` | Sign in |
| Signup | `/signup` | Register |

---

## 🔍 Check Data in MongoDB

```bash
# Connect to MongoDB
mongosh mongodb://127.0.0.1:27017/skillswap

# View users
db.users.find().pretty()

# View exchanges
db.exchanges.find().pretty()

# View messages
db.messages.find().pretty()

# View reviews (see rating and comment)
db.reviews.find().pretty()

# View offered skills
db.offeredskills.find().pretty()

# View requested skills
db.requestedskills.find().pretty()
```

---

## ✅ What's Working

### Exchange System
- ✅ Create swap requests from skill cards
- ✅ Accept/decline requests
- ✅ Mark exchanges as complete
- ✅ Filter by role (requester/provider) and status
- ✅ Auto-notifications on status changes

### Messaging
- ✅ Send messages to skill owners
- ✅ Real-time delivery via Socket.IO
- ✅ Thread view with auto-scroll
- ✅ Read receipts
- ✅ Message persistence in MongoDB

### Reviews & Ratings
- ✅ 5-star rating system
- ✅ Comment up to 500 characters
- ✅ Auto-update user averageRating
- ✅ Auto-update reviewsCount
- ✅ Display on profiles
- ✅ Can only review after completing exchange

### Skills & Categories
- ✅ Normalized categories (prevents duplicates)
- ✅ Normalized skill titles (auto title-case)
- ✅ Full-text search
- ✅ Category and location filters
- ✅ Separate offered/requested skills

---

## 🎉 Success!

All features are **fully functional** and integrated:
1. ✅ Request skill swaps
2. ✅ Accept/decline requests
3. ✅ Message between users
4. ✅ Review and rate after exchange
5. ✅ Auto-updating ratings
6. ✅ Real-time notifications
7. ✅ MongoDB persistence

**Everything connects to the backend - no placeholder data!** 🚀
