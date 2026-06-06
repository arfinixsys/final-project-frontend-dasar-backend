# Ignite Backend API

REST API untuk aplikasi **Ignite Habit Tracker**. Dibangun dengan Express + TypeScript.

> Repo ini hanya berisi backend. Frontend tersedia di repo terpisah.

## Setup

```bash
npm install
cp .env.example .env   # Edit JWT_SECRET sebelum deploy ke production
npm run dev            # → http://localhost:3000
```

## Struktur

```
src/
├── controllers/
│   ├── auth.controller.ts        # Register, login, get me, update profile
│   ├── habits.controller.ts      # CRUD habits + archive/unarchive
│   └── completions.controller.ts # Toggle completion & update catatan
├── db/
│   └── store.ts                  # In-memory store dengan auto-save ke db.json
├── middleware/
│   └── auth.middleware.ts        # Verifikasi JWT
├── routes/
│   ├── auth.routes.ts
│   ├── habits.routes.ts
│   └── completions.routes.ts
├── types/
│   └── index.ts                  # Shared TypeScript types
└── index.ts                      # Entry point Express
```

## Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Dev server dengan hot reload (tsx watch) |
| `npm run build` | Compile TypeScript ke `dist/` |
| `npm start` | Jalankan dari hasil build |

## API Reference

### Auth

| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/api/auth/register` | `{ name, email, password }` | ❌ |
| POST | `/api/auth/login` | `{ email, password }` | ❌ |
| GET | `/api/auth/me` | — | ✅ |
| PUT | `/api/auth/profile` | `{ name?, email?, currentPassword?, newPassword? }` | ✅ |

### Habits

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/habits` | ✅ |
| POST | `/api/habits` | ✅ |
| GET | `/api/habits/:id` | ✅ |
| PUT | `/api/habits/:id` | ✅ |
| PATCH | `/api/habits/:id/archive` | ✅ |
| PATCH | `/api/habits/:id/unarchive` | ✅ |
| DELETE | `/api/habits/:id` | ✅ |

### Completions

| Method | Path | Body | Auth |
|--------|------|------|------|
| GET | `/api/completions` | — | ✅ |
| POST | `/api/completions/toggle` | `{ habitId, date }` | ✅ |
| PUT | `/api/completions/note` | `{ habitId, date, note }` | ✅ |

## Auth

Semua protected route membutuhkan header:
```
Authorization: Bearer <token>
```

Token didapat dari response `/api/auth/login` atau `/api/auth/register`.
Default expire: `7d` (bisa diubah via `JWT_EXPIRES_IN`).

## Data Persistence

Data disimpan otomatis ke `db.json` di root project (dibuat saat pertama kali dijalankan).
File ini sudah di-gitignore — tidak perlu database eksternal untuk development.

## Integrasi dengan Frontend

Tambahkan di `.env` frontend:
```env
VITE_API_URL=http://localhost:3000/api
```

Semua request dari frontend menggunakan `Authorization: Bearer <token>` header
yang disimpan di `localStorage` setelah login.
