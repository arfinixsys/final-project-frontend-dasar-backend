# Ignite Backend API

REST API for the Ignite Habit Tracker app, built with **Express + TypeScript**.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET before production
npm run dev            # starts on http://localhost:3000
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

## Data persistence

Data is stored in `db.json` (auto-created on first run). No external database needed.

## Auth

JWT-based authentication. All protected routes require:
```
Authorization: Bearer <token>
```

Token is returned on login/register and expires based on `JWT_EXPIRES_IN` (default `7d`).
