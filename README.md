# vibe_client

A Next.js 15 + Convex template pre-wired to authenticate with [vibe_auth](https://github.com/gitcoder89431/vibe_auth).

Deploy vibe_auth once, point any number of vibe_client apps at it. Users sign in through your auth hub — your Convex app verifies their identity via signed JWTs and JWKS.

## How it works

```
User → vibe_auth (sign in) → server-side relay fetches JWT
     → redirect to vibe_client?_vibe_token=<jwt>
     → JWT stored in localStorage → passed to Convex
     → Convex verifies JWT via JWKS → identity confirmed
```

1. User clicks "Sign in" — redirected to your vibe_auth instance
2. After sign-in, vibe_auth's server-side relay fetches a signed JWT and appends it to the redirect URL
3. vibe_client reads `_vibe_token` from the URL on landing, stores it in localStorage
4. `ConvexProviderWithAuth` passes the JWT to Convex on every request
5. Convex verifies the JWT against vibe_auth's JWKS endpoint
6. `ctx.auth.getUserIdentity()` returns the user's identity in any Convex function

## Stack

- [Next.js 15](https://nextjs.org) — App Router, server components
- [Convex](https://convex.dev) — real-time backend + database
- [vibe_auth](https://github.com/gitcoder89431/vibe_auth) — self-hosted auth hub (JWT issuer)

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

This must match `BETTER_AUTH_URL` on your vibe_auth instance exactly.

### 5. Add your app's URL to vibe_auth trusted origins

In your vibe_auth admin → Settings → Trusted Origins, add your app's URL (e.g. `http://localhost:3001`).

### 6. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `.env.local` | Your Convex deployment URL |
| `NEXT_PUBLIC_VIBE_AUTH_URL` | `.env.local` | Your vibe_auth instance URL |
| `VIBE_AUTH_URL` | Convex Dashboard | Same as above — used by Convex to verify JWTs |

## Project structure

```
src/
├── app/
│   ├── page.tsx          # Public home — sign in / dashboard link
│   ├── dashboard/
│   │   └── page.tsx      # Protected — redirects if not signed in
│   ├── providers.tsx     # ConvexProviderWithAuth wired to vibe_auth
│   └── layout.tsx
├── lib/
│   └── auth.ts           # JWT utilities — token storage, session parsing, sign out
convex/
├── auth.config.ts        # Points Convex to vibe_auth JWKS
├── schema.ts             # Users table
└── users.ts              # me query + getOrCreate mutation
```

## Connecting users to Convex

On first sign-in, call `users.getOrCreate` to create a Convex record linked to the user's vibe_auth ID:

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

After that, `ctx.auth.getUserIdentity().subject` in any Convex function is the user's vibe_auth user ID — use it to scope all data.

## Requires

A running [vibe_auth](https://github.com/gitcoder89431/vibe_auth) instance. Deploy to Vercel in one click — see vibe_auth README.
