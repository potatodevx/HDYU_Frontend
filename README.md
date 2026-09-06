# HDYU Frontend Prototype

This is the browser-only HDYU prototype. It does not require a database or environment variables.

Prototype accounts, passwords, generated HDYU IDs, linked-wallet details, and reward submissions are stored in the browser's `localStorage`. This is intentionally convenient for client demonstrations, but it is not secure or shared between devices and must be replaced by server-side authentication and a database before production.

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

## Vercel

Connect this repository to Vercel and deploy with the default Next.js settings. No environment variables are required for the prototype. Solana features use Devnet and the public Devnet RPC by default.

The optional `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_SOLANA_CLUSTER`, and `NEXT_PUBLIC_HDYU_MINT` variables can override those defaults later, but they are not needed for the current demo.

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
