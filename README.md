# Melodify - Modern AI-Powered Cloud Music Streaming Platform

Melodify is a production-ready, high-fidelity cloud music streaming platform. It features seamless HTML5 audio streaming, Redux state management, JWT authentication (including Google login, password resets, and sessions), an AI Playlist Generator, an AI Music Studio to compose tracks and lyrics, and an administrative dashboard for catalog management.

---

## Technical Stack

- **Frontend**: React.js (Vite, TypeScript), Redux Toolkit, Tailwind CSS, React Router DOM, Axios, HTML5 Audio API.
- **Backend**: Node.js, Express.js (MVC Architecture).
- **Database**: MongoDB (via Mongoose ODM).
- **Authentication**: JSON Web Tokens (JWT), Bcrypt Password Hashing, Google OAuth.
- **Storage**: Firebase Storage (for audio streams and cover images).

---

## Installation & Setup Guide

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Backend Server Setup

Navigate to the `server` directory, install dependencies, and start the development server:

```bash
# Navigate to backend
cd server

# Install dependencies
npm install

# Start in development mode (using nodemon)
npm run dev
```

#### Environment Variables (`server/.env`)

Create or update the `server/.env` configuration file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/melodify
JWT_SECRET=melodify_super_secret_jwt_token_key_2026
GOOGLE_CLIENT_ID=your_google_client_id
```

*Note: The backend automatically seeds MongoDB with default tracks and playlists if the collection is empty on startup.*

### 2. Frontend React Setup

From the root directory, install dependencies and launch the Vite development server:

```bash
# Install frontend dependencies
npm install

# Start React app locally
npm run dev
```

---

## Backend API Documentation

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Create user profile & return token | No |
| `POST` | `/api/auth/login` | Authenticate user & return token | No |
| `POST` | `/api/auth/google` | Google sign-in oauth registration | No |
| `POST` | `/api/auth/forgot-password` | Generate reset verification token | No |
| `POST` | `/api/auth/reset-password` | Reset password using token | No |
| `GET` | `/api/auth/me` | Fetch active user profile details | Yes |

### 2. Tracks & Search Endpoints (`/api/tracks`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tracks` | Fetch all tracks with genre/mood filters | No |
| `GET` | `/api/tracks/search?q=...` | Intelligent query results & autocomplete suggestions | No |
| `POST` | `/api/tracks/:id/favorite` | Toggle track in user Liked list | Yes |
| `POST` | `/api/tracks/:id/play` | Increment playCount and log in History | Yes |
| `GET` | `/api/tracks/favorites` | Fetch user's favorited (Liked) tracks | Yes |

### 3. Playlists & AI Endpoints (`/api/playlists`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/playlists` | Create a new empty playlist | Yes |
| `GET` | `/api/playlists` | Fetch user playlists + public AI playlists | Yes |
| `GET` | `/api/playlists/:id` | Fetch playlist tracks | Yes |
| `PUT` | `/api/playlists/:id` | Rename / edit playlist tracks | Yes |
| `DELETE` | `/api/playlists/:id` | Delete playlist | Yes |
| `POST` | `/api/playlists/generate-ai` | Recommend and save personalized playlist | Yes |
| `POST` | `/api/playlists/studio-generate` | AI Music Studio: generate mock lyrics & stream URL | Yes |

### 4. Admin Administration Endpoints (`/api/admin`)

*All admin endpoints require valid JWT and `role: "admin"`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | System stats summary (users, tracks, plays, etc.) |
| `GET` | `/api/admin/users` | List all user accounts |
| `PUT` | `/api/admin/users/:id` | Modify user roles or membership plans |
| `DELETE` | `/api/admin/users/:id` | Remove user |
| `POST` | `/api/admin/tracks` | Upload/register song |
| `PUT` | `/api/admin/tracks/:id` | Edit song metadata details |
| `DELETE` | `/api/admin/tracks/:id` | Delete song from database catalog |

---

## Production Deployment Guide

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel.
2. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add a `vercel.json` file in the project root to support React Router single-page application routing redirection:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Backend Deployment (Render)

1. Deploy the backend on Render as a **Web Service**.
2. Configure environment variables in Render settings corresponding to:
   - `PORT=10000` (or Render default)
   - `MONGO_URI` (MongoDB Atlas Connection URL)
   - `JWT_SECRET`
3. Set the **Build Command** to `npm install` (inside the server directory or root depending on settings) and the **Start Command** to `node server/index.js`.
4. Ensure your React frontend links Axios calls to the Render backend URL (e.g. update API base urls to point to `https://melodify-api.onrender.com` instead of `localhost`).

---

## Architecture & Code Quality Guidelines

- **Style Validation**: All generated React components avoid hardcoded hex codes inside the JSX `className` attribute. Styling tokens (background `#0B0B0B`, cards `#181818`, primary `#E50914`, border `#262626`) are bound to custom tailwind configuration variables.
- **Type Safety**: Every component includes a typed `Readonly` Props interface.
- **Logic Decoupling**: Business state lives inside Redux slices (`authSlice`, `playbackSlice`, `playlistSlice`) and the HTML5 audio element hooks into React context (`PlaybackContext.tsx`), preserving atomic component layout integrity.
