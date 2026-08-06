# Vercel Deployment Guide

## 1. Push your changes

```bash
cd "c:\Users\DELL\Desktop\Result app\URMIS DOCUMENT\urmis"
git add .
git commit -m "Configure Vercel deployment"
git push origin master
```

## 2. Install Vercel CLI (optional)

```bash
npm install -g vercel
```

## 3. Deploy with Vercel CLI

```bash
npx vercel
```

Follow the prompts:
- Select the current directory as project root
- Choose `npm run build` as the build command
- Leave the output directory blank
- Confirm deployment

For production deployment:

```bash
npx vercel --prod
```

## 4. Set environment variables in Vercel

In Vercel dashboard, add these variables:

- `NEXT_PUBLIC_API_BASE`
  - Example: `https://<your-vercel-app>.vercel.app`
- `DATABASE_URL`
  - Your production PostgreSQL connection string
- `JWT_SECRET`
  - A strong secret string
- `NODE_ENV`
  - `production`

## 5. What is already configured

- `vercel.json` routes `/api/*` to the Express backend serverless entrypoint
- `api/backend.js` exports the Express app via `serverless-http`
- `app/register/page.jsx` is wrapped in `Suspense` for Next.js compatibility
- `npm run build` passes successfully

## 6. Verify after deployment

Open the deployed app and test:
- `/login`
- `/register`
- API route: `/api/auth/me`

If you want, you can also deploy a preview first with `npx vercel --prebuilt`.
