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

## Deployment & required secrets

This project is intended to be deployed on Vercel. When deploying or running CI, set the following repository or project secrets:

- `DATABASE_URL` — Postgres connection string (Neon or other provider), e.g. `postgres://user:pass@host:5432/db`.
- `GITHUB_ID` and `GITHUB_SECRET` — GitHub OAuth app credentials used by `next-auth`.
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — (optional) required by the provided Vercel deploy workflow.

Local build and verification commands (run in project root):

```bash
npm ci
npm run build
```

Notes:
- The repo includes example workflows: `.github/workflows/ci.yml` (build + secrets check) and `.github/workflows/vercel-deploy.yml` (push-to-main deploy using Vercel token).
- Keep `DATABASE_URL` only in GitHub Secrets / Vercel Environment Variables; never expose it to the client or commit it to source.

