# vibe_client

[![CI](https://github.com/gitcoder89431/vibe_client/actions/workflows/ci.yml/badge.svg)](https://github.com/gitcoder89431/vibe_client/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Convex](https://img.shields.io/badge/Convex-latest-orange)

> A Next.js + Convex starter pre-wired to authenticate with [VibeAuth](https://github.com/gitcoder89431/vibe_auth).
> Clone it, set two env vars, have working auth in 5 minutes.

**Live demo:** [vibe.ruixen.app](https://vibe.ruixen.app) · auth via [accounts.ruixen.app](https://accounts.ruixen.app)

![vibe_client screenshot](screenshot.png)

---

## Requires

A running [VibeAuth](https://github.com/gitcoder89431/vibe_auth) instance — deploy one to Vercel in one click before continuing.

---

## How it works

```
User → VibeAuth (sign in) → server-side relay fetches JWT
     → redirect to vibe_client?_vibe_token=<jwt>
     → JWT stored in localStorage → passed to Convex
     → Convex verifies JWT via JWKS → identity confirmed
```

1. User clicks "Sign in" — redirected to your VibeAuth instance
2. After sign-in, VibeAuth's server-side relay fetches a signed JWT and appends it to the redirect URL
3. vibe_client reads `_vibe_token` from the URL on landing, stores it in localStorage
4. `ConvexProviderWithAuth` passes the JWT to Convex on every request
5. Convex verifies the JWT against VibeAuth's JWKS endpoint
6. `ctx.auth.getUserIdentity()` returns the user's identity in any Convex function

The JWT flow works with any backend that can verify a JWT against a JWKS URL — Convex is what this template uses, but Express, FastAPI, or anything else works the same way.

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/gitcoder89431/vibe_client
cd vibe_client
pnpm install
```

### 2. Set up Convex

```bash
pnpm convex:dev
```

This creates your Convex project and generates `convex/_generated/`. Copy the `NEXT_PUBLIC_CONVEX_URL` it outputs.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_VIBE_AUTH_URL=https://accounts.yourdomain.com
```

### 4. Set env var in Convex dashboard

In [convex.dev](https://convex.dev) → your project → Settings → Environment Variables:

```
VIBE_AUTH_URL = https://accounts.yourdomain.com
```

This must match `BETTER_AUTH_URL` on your VibeAuth instance exactly.

### 5. Add your app's URL to VibeAuth trusted origins

In your VibeAuth admin → Settings → Trusted Origins, add your app's URL (e.g. `http://localhost:3001`).

### 6. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local` | Your Convex deployment URL |
| `NEXT_PUBLIC_VIBE_AUTH_URL` | `.env.local` | Your VibeAuth instance URL (e.g. `https://accounts.yourdomain.com`) |
| `VIBE_AUTH_URL` | Convex Dashboard | Same as above — used by Convex to verify JWTs |

## Project structure

```
src/
├── app/
│   ├── page.tsx          # Public home — sign in / dashboard link
│   ├── dashboard/
│   │   └── page.tsx      # Protected — redirects if not signed in
│   ├── providers.tsx     # ConvexProviderWithAuth wired to VibeAuth
│   └── layout.tsx
├── lib/
│   └── auth.ts           # JWT utilities — token storage, session parsing, sign out
convex/
├── auth.config.ts        # Points Convex to VibeAuth JWKS
├── schema.ts             # Users table
└── users.ts              # me query + getOrCreate mutation
```

## Building a new app from this template

Clone this repo as your starting point. For each new project, only three things change:

| Thing | Action |
|---|---|
| Convex project | Run `pnpm convex:dev` — new project, new `NEXT_PUBLIC_CONVEX_URL` |
| `NEXT_PUBLIC_VIBE_AUTH_URL` | Point to your VibeAuth instance (e.g. `https://accounts.yourdomain.com`) |
| `VIBE_AUTH_URL` in Convex dashboard | Same as above |

**These files copy as-is to every project — never touch them:**
- `convex/auth.config.ts` — points Convex to VibeAuth JWKS, identical everywhere
- `src/lib/auth.ts` — JWT utilities, identical everywhere
- `src/app/providers.tsx` — ConvexProviderWithAuth setup, identical everywhere

**Schema pattern — anchor everything to `vibeAuthId`:**

The `sub` claim in the JWT is the VibeAuth user ID and is **consistent across all your apps** — the same user gets the same ID everywhere.

```ts
// convex/schema.ts
defineTable({
    vibeAuthId: v.string(),  // = ctx.auth.getUserIdentity().subject
    email: v.string(),
    // ...your app-specific fields
}).index("by_vibeAuthId", ["vibeAuthId"])
```

```ts
// any Convex query/mutation — look up the current user
const identity = await ctx.auth.getUserIdentity()
const user = await ctx.db.query("users")
    .withIndex("by_vibeAuthId", q => q.eq("vibeAuthId", identity.subject))
    .first()
```

## Connecting users to Convex

On first sign-in, call `users.getOrCreate` to create a Convex record linked to the user's VibeAuth ID:

```ts
const getOrCreate = useMutation(api.users.getOrCreate)

useEffect(() => {
  if (session) {
    getOrCreate({
      email: session.user.email,
      name: session.user.name ?? undefined,
    })
  }
}, [session])
```

After that, `ctx.auth.getUserIdentity().subject` in any Convex function is the user's VibeAuth user ID — use it to scope all data.

## Stack

- [Next.js 15](https://nextjs.org) — App Router, server components
- [Convex](https://convex.dev) — real-time backend + database
- [VibeAuth](https://github.com/gitcoder89431/vibe_auth) — self-hosted auth hub (JWT issuer)
