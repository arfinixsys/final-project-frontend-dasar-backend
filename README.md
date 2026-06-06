# 🔥 Ignite — Habit Tracker

Aplikasi habit tracker full-stack dengan fitur streak, analytics, dan achievement badges.

## Struktur Project

```
ignite/
├── src/                  # Frontend — React + TypeScript + Vite
├── backend/              # Backend — Express + TypeScript
├── .env.example          # Template environment variable frontend
└── README.md
```

## Tech Stack

| | Frontend | Backend |
|---|---|---|
| Framework | React 19 + Vite | Express 4 |
| Language | TypeScript 6 | TypeScript 5 |
| State | Zustand 5 | — |
| Styling | Tailwind CSS 4 + shadcn/ui | — |
| Auth | JWT (via API) | JWT + bcryptjs |
| Validasi | React Hook Form + Zod | Zod |
| Charts | Chart.js + react-chartjs-2 | — |
| DB | — | In-memory + db.json |

---

## Setup & Menjalankan

### 1. Frontend

```bash
# Di root project
cp .env.example .env
npm install
npm run dev
# → http://localhost:5173
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # Edit JWT_SECRET sebelum deploy ke production
npm install
npm run dev
# → http://localhost:3000
```

Jalankan keduanya secara bersamaan di terminal terpisah.

---

## Fitur

- **Auth** — Register dan login dengan JWT, session tersimpan di localStorage
- **Today View** — Daftar habit yang due hari ini, progress bar, konfeti saat semua selesai
- **Habit Management** — Tambah, edit, archive, dan hapus habit dengan berbagai tipe recurrence
- **Recurrence Types** — Daily, weekdays, weekends, hari tertentu, setiap N hari, atau bulanan
- **Stats & Analytics** — Streak, consistency score, momentum, break risk, heatmap 16 minggu
- **Habit Detail** — Mini calendar, weekly bar chart, korelasi antar habit
- **Achievement Badges** — 9 badge yang bisa di-unlock berdasarkan performa
- **Reminders** — Notifikasi browser berdasarkan `reminderTime` yang diset per habit

---

## API Endpoints

### Auth
```
POST   /api/auth/register     Body: { name, email, password }
POST   /api/auth/login        Body: { email, password }
GET    /api/auth/me           Header: Authorization: Bearer <token>
PUT    /api/auth/profile      Header: Authorization: Bearer <token>
```

### Habits
```
GET    /api/habits            Semua habit milik user
POST   /api/habits            Buat habit baru
GET    /api/habits/:id        Detail habit
PUT    /api/habits/:id        Update habit
PATCH  /api/habits/:id/archive    Archive habit
PATCH  /api/habits/:id/unarchive  Unarchive habit
DELETE /api/habits/:id        Hapus habit beserta completions
```

### Completions
```
GET    /api/completions              Semua completion milik user
POST   /api/completions/toggle       Toggle completion { habitId, date }
PUT    /api/completions/note         Update catatan { habitId, date, note }
```

---

## Environment Variables

**Frontend (`.env`)**
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend (`backend/.env`)**
```env
PORT=3000
JWT_SECRET=ganti_ini_sebelum_deploy
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## Scripts

| Lokasi | Command | Keterangan |
|---|---|---|
| Root | `npm run dev` | Jalankan frontend dev server |
| Root | `npm run build` | Build frontend untuk production |
| Root | `npm run lint` | ESLint check |
| `backend/` | `npm run dev` | Jalankan backend dengan hot reload |
| `backend/` | `npm run build` | Compile TypeScript ke `dist/` |
| `backend/` | `npm start` | Jalankan backend dari hasil build |
