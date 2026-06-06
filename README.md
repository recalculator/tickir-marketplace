# LendFlow Marketplace (Repo 1 of 2)

Front-end platform where borrowers post loan requests and lenders browse, filter, and express interest. When a match is accepted, it hands off to LendFlow Underwriter (Repo 2) via a versioned REST API.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (JWT sessions, credentials provider)
- **Email**: Resend

## Quick Start

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY

npm install
npx prisma migrate dev
npm run dev
```

## API Overview

All endpoints are under `/api/v1`.

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Lenders | `POST /lenders`, `GET/PUT /lenders/me`, `PUT /lenders/me/preferences` |
| Loan Requests | `POST /loan-requests`, `GET /loan-requests`, `GET /loan-requests/matching` |
| Interests | `POST /loan-requests/:id/interests`, `PUT /interests/:id/{accept,decline,withdraw}` |
| Conversations | `GET/POST /conversations/:id/messages` |
| Cross-Repo | `GET /interests/:id/export`, `POST /interests/:id/mark-imported` |

## Roles

| Role | Access |
|------|--------|
| `BORROWER` | Self-register, post loan requests, accept/decline interest |
| `LENDER_USER` | Browse marketplace, express interest, chat |
| `LENDER_ADMIN` | All LENDER_USER + manage institution profile/preferences/members |
| `PLATFORM_ADMIN` | Full platform access, create lenders, trigger handoffs |

## Cross-Repo Integration

Repo 2 (Underwriter) authenticates with `UNDERWRITER_SERVICE_TOKEN` and calls:

1. `GET /api/v1/interests/:id/export` — fetch match data
2. `POST /api/v1/interests/:id/mark-imported` — store `underwriterDealId` back-reference

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
