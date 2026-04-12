# 🚀 Smart Local Life — AI-Powered Service Marketplace

A full-stack MERN application connecting users with local service providers using Google Gemini AI recommendations.

---

## 🗂️ Project Structure

```
smart-local-life/
├── backend/     → Node.js + Express + MongoDB API
└── frontend/    → React + Vite + Tailwind CSS
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd smart-local-life

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy and fill in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Fill in:
- `MONGO_URI` → your MongoDB Atlas connection string
- `JWT_SECRET` → any long random string
- `GEMINI_API_KEY` → your Google Gemini API key
- `CLIENT_URL` → http://localhost:5173

**Frontend** — copy and fill in `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

Fill in:
- `VITE_API_URL` → http://localhost:5000/api

### 3. Run Development Servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:5173

---

## 🌐 API Endpoints

| Method | Route                         | Access        | Description                  |
|--------|-------------------------------|---------------|------------------------------|
| POST   | /api/auth/register            | Public        | Register user/provider       |
| POST   | /api/auth/login               | Public        | Login                        |
| GET    | /api/auth/me                  | Private       | Get current user             |
| PUT    | /api/auth/profile             | Private       | Update profile               |
| GET    | /api/services                 | Public        | Get all services (filtered)  |
| GET    | /api/services/:id             | Public        | Get service by ID            |
| POST   | /api/services                 | Provider      | Create service               |
| PUT    | /api/services/:id             | Provider      | Update service               |
| DELETE | /api/services/:id             | Provider      | Delete service               |
| GET    | /api/services/my              | Provider      | Get my services              |
| POST   | /api/bookings                 | User          | Create booking               |
| GET    | /api/bookings/my              | Private       | Get my bookings              |
| GET    | /api/bookings/provider        | Provider      | Get provider bookings        |
| PUT    | /api/bookings/:id/status      | Private       | Update booking status        |
| POST   | /api/reviews                  | User          | Add review                   |
| GET    | /api/reviews/service/:id      | Public        | Get service reviews          |
| POST   | /api/ai/chat                  | Private       | AI chatbot                   |
| GET    | /api/ai/recommendations       | Private       | AI recommendations           |
| GET    | /api/ai/trending              | Public        | Trending services            |

---

## 🚀 Deployment

### Backend → Render

1. Push to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, select `backend/` as root
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add all environment variables from `.env`

### Frontend → Vercel

1. Go to https://vercel.com → New Project
2. Import repo, set root to `frontend/`
3. Add env: `VITE_API_URL=https://your-render-url.onrender.com/api`
4. Deploy!

### Database → MongoDB Atlas

1. Create free cluster at https://cloud.mongodb.com
2. Create a database user
3. Whitelist all IPs (0.0.0.0/0) for Render
4. Copy connection string to `MONGO_URI`

---

## 🧠 AI Features

- **Chatbot**: Users can type natural language queries like "I need a plumber under ₹500 in Hyderabad"
- **Smart Recommendations**: Scored by rating (40%), price (25%), popularity (20%), personalization (15%)
- **Trending**: Most booked services in the last 7 days

---

## 🛠️ Tech Stack

| Layer    | Technology                             |
|----------|----------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend  | Node.js, Express, Mongoose             |
| Database | MongoDB Atlas                          |
| Auth     | JWT, bcryptjs                          |
| AI       | Google Gemini 1.5 Flash               |
| Deploy   | Vercel (FE), Render (BE), Atlas (DB)  |

---

## 📦 Features

- ✅ JWT Authentication (User / Provider / Admin roles)
- ✅ Service CRUD with geospatial indexing
- ✅ Booking system with status management
- ✅ Reviews & ratings with auto-average update
- ✅ AI chatbot powered by Gemini
- ✅ Smart recommendation engine
- ✅ Dark mode
- ✅ Fully responsive (mobile-first)
- ✅ Rate limiting & security headers
- ✅ Location-based search

---

## 👤 Demo Accounts

Seed the database then use:

- **User**: demo@user.com / 123456
- **Provider**: demo@provider.com / 123456
