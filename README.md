# Slime Shop — Full Updated Version

This is a full Next.js + Supabase shop project with the requested upgrades already added.

## Added features

- Admin product manager with customizable product fields
- Product page custom options: text/name, preferred color, and size
- Admin coupon manager
- Safe coupon math so the order total can never go below `$0.00`
- Admin company settings page
- Maintenance mode
- Public `/status` page
- Top online/offline banner
- More professional company-style homepage and footer

## Setup steps

### 1. Unzip this folder

Unzip `slime-shop-full-updated.zip`.

### 2. Install packages

```bash
npm install
```

### 3. Create `.env.local`

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase keys, NextAuth secret, and Google OAuth keys.

### 4. Run the Supabase SQL

Open Supabase → SQL Editor → paste everything from:

```text
supabase/schema.sql
```

Then click **Run**.

### 5. Set your admin email

Open:

```text
config/constants.ts
```

Make sure your email is inside `ADMIN_EMAILS`.

### 6. Run locally

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### 7. Open admin panel

Go to:

```text
http://localhost:3000/admin
```

Use your Google admin login.

### 8. Push to GitHub

```bash
git init
git add .
git commit -m "Add full updated slime shop"
git branch -M main
git remote add origin https://github.com/Madster522/slime-shop.git
git push -u origin main
```

If this repo already exists locally, use:

```bash
git add .
git commit -m "Add maintenance status products and safe coupons"
git push origin main
```

### 9. Vercel

After pushing to GitHub, Vercel should redeploy automatically. Add the same `.env.local` variables into Vercel Project Settings → Environment Variables.

## Notes

The checkout page is left as a payment placeholder so you can reconnect Stripe or Square safely. The cart, customization, coupon safety, maintenance mode, and status controls are already wired up.
