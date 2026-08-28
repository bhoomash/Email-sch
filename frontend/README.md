# 🎨 ReachInbox Email Scheduler — Frontend Client

Modern React dashboard built with TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, and Lucide Icons.

---

## 🛠️ Tech Stack

- **Framework**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management & Fetching**: TanStack Query (React Query) + Axios
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## ⚙️ Local Development Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 3: Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 🚀 Deployment to Vercel

1. Push `frontend/` to GitHub as its own repository.
2. Go to [Vercel Dashboard](https://vercel.com/new) -> Import Repository.
3. Set Framework Preset: **Vite**.
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend API URL (e.g. `https://reachinbox-backend-api.onrender.com`)
