# 🟢 Slime Shop — 3D Printed Products E-Commerce

A full-stack Next.js + Supabase shop for custom 3D printed slime-themed products.

## Tech Stack
- **Next.js 14** (Pages Router, TypeScript)
- **Supabase** (PostgreSQL database + Auth)
- **NextAuth** (Google OAuth)
- **Square** (Payments + Apple Pay)
- **Tailwind CSS** (Styling)
- **qrcode.react** (Thank You card QR codes)

## Quick Start

```bash
# 1. Install
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in all keys (see below)

# 3. Run Supabase schema
# Copy supabase/schema.sql → paste into Supabase SQL Editor → Run

# 4. Start dev server
npm run dev

# 5. (Optional) Start printer bridge for USB/Bambu
npm run bridge
```

## Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<32 random chars>

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Square — get from https://developer.squareup.com/apps
NEXT_PUBLIC_SQUARE_APP_ID=sandbox-sq0idb-xxx
NEXT_PUBLIC_SQUARE_LOCATION_ID=xxx
SQUARE_ACCESS_TOKEN=EAAAxxxx
SQUARE_ENVIRONMENT=sandbox   # change to: production

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Admin Access
Add your email to `ADMIN_EMAILS` in `config/constants.ts`:
```ts
export const ADMIN_EMAILS = ['your@email.com']
```

## Pages
| Route | Description |
|---|---|
| `/` | Homepage with featured products |
| `/shop` | Full product catalog |
| `/product/[slug]` | Product detail + add to cart |
| `/cart` | Shopping cart |
| `/checkout` | Square payment checkout |
| `/track` | Order tracking |
| `/account` | Order history |
| `/admin` | Dashboard |
| `/admin/orders` | Order management |
| `/admin/products` | Product CRUD |
| `/admin/printers` | Printer management |
| `/admin/print-queue` | Print queue |
| `/admin/monitoring` | Live printer status + alerts |
| `/admin/thank-you-cards` | Print thank you cards with QR codes |
| `/admin/bugs` | Bug report tracker |

## Thank You Cards
Update links in `pages/admin/thank-you-cards.tsx`:
```ts
const LINKS = {
  website: 'https://yoursite.com',
  discord: 'https://discord.gg/invite',
  roblox:  'https://roblox.com/groups/ID',
}
```

## Square Production
1. Get production keys from Square Developer Dashboard
2. Change `.env.local`:
   - `SQUARE_ENVIRONMENT=production`
   - `NEXT_PUBLIC_SQUARE_APP_ID=sq0idp-xxx` (production app ID)
   - `SQUARE_ACCESS_TOKEN=EAAAxxxx` (production access token)
3. Change script src in `checkout.tsx` to `https://web.squarecdn.com/v1/square.js`
