# Ignite Backend API

REST API untuk aplikasi Ignite Habit Tracker. Dibangun dengan **Express + TypeScript**.

## Setup

```bash
npm install
cp .env.example .env   # Edit JWT_SECRET sebelum deploy
npm run dev            # Dev server dengan hot reload → http://localhost:3000
```

## Struktur

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts        # Register, login, profile
│   │   ├── habits.controller.ts      # CRUD habits
│   │   └── completions.controller.ts # Toggle & catatan completion
│   ├── db/
│   │   └── store.ts                  # In-memory store + auto-save db.json
│   ├── middleware/
│   │   └── auth.middleware.ts        # JWT verification
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── habits.routes.ts
│   │   └── completions.routes.ts
│   ├── types/
│   │   └── index.ts                  # Shared TypeScript types
│   └── index.ts                      # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

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

Token didapat dari response `/api/auth/login` atau `/api/auth/register`. Default expire: `7d`.

## Data Persistence

Data disimpan di `db.json` (auto-dibuat saat pertama kali dijalankan). Tidak perlu database eksternal.

> File `db.json` sudah di-gitignore — jangan di-commit.
