# Deployment Guide

## Stack
- **Frontend + API**: Next.js 14 (App Router) → Vercel
- **Database**: PostgreSQL → Supabase / Neon / Railway
- **Payments**: Stripe
- **Supplier**: CJ Dropshipping API
- **Email**: SMTP (Gmail / Resend / Postmark)

---

## 1. Database Setup

### Option A: Supabase (recommended, free tier)
1. Create project at https://supabase.com
2. Copy connection string from Settings → Database → Connection string (URI mode)
3. Set `DATABASE_URL` in your `.env`

### Option B: Neon (serverless, free tier)
1. Create database at https://neon.tech
2. Copy connection string

### Run migrations
```bash
cd ecommerce
npx prisma migrate dev --name init
# or for production:
npx prisma migrate deploy
```

---

## 2. Stripe Setup

1. Create account at https://stripe.com
2. Get keys from Dashboard → Developers → API Keys
3. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Webhook Setup (local dev)
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret into STRIPE_WEBHOOK_SECRET
```

### Webhook Setup (production)
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/stripe/webhook`
3. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 3. CJ Dropshipping Setup

1. Sign up at https://app.cjdropshipping.com/register.html
2. Set `CJ_EMAIL` and `CJ_PASSWORD` in `.env`
3. After deployment, trigger initial product sync:

```bash
# Run the sync script
npm run sync:products

# Or call the API endpoint
curl -X POST https://your-domain.com/api/supplier/sync-products \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"pageNum": 1, "pageSize": 50}'
```

---

## 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from ecommerce directory
cd ecommerce
vercel

# Set environment variables (or do it in Vercel dashboard)
vercel env add DATABASE_URL
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add CJ_EMAIL
vercel env add CJ_PASSWORD
vercel env add SMTP_HOST
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add ADMIN_SECRET
vercel env add CRON_SECRET
vercel env add NEXT_PUBLIC_STORE_NAME

# Deploy to production
vercel --prod
```

The `vercel.json` file configures:
- **Cron job**: Price sync runs every 6 hours automatically
- **Function timeouts**: Extended for sync and webhook routes

---

## 5. Post-Deployment Checklist

- [ ] Run `prisma migrate deploy` in production
- [ ] Configure Stripe webhook endpoint with production URL
- [ ] Trigger initial product sync
- [ ] Test checkout with Stripe test card: `4242 4242 4242 4242`
- [ ] Verify order confirmation email arrives
- [ ] Verify supplier order is created in CJ dashboard
- [ ] Test admin panel at `/admin`

---

## 6. Custom Domain

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain and follow DNS instructions

---

## API Routes Summary

| Route | Method | Description |
|-------|--------|-------------|
| `/api/products` | GET | List products (paginated, filterable) |
| `/api/stripe/create-intent` | POST | Create Stripe payment intent + order |
| `/api/stripe/webhook` | POST | Handle Stripe events (payment success, refund) |
| `/api/supplier/sync-products` | POST | Sync products from CJ (requires CRON_SECRET) |
| `/api/cron/price-sync` | GET | Update prices (runs automatically via Vercel Cron) |
| `/api/admin/orders` | GET | List all orders (requires ADMIN_SECRET header) |
| `/api/admin/orders/[id]` | GET/PATCH | View/update order (requires ADMIN_SECRET header) |

---

## Order Flow

```
Customer places order
       │
       ▼
POST /api/stripe/create-intent
  → Validates cart items against DB prices
  → Creates Customer (upsert)
  → Creates Order (PENDING)
  → Creates Stripe PaymentIntent
       │
       ▼
Stripe Elements confirms payment on client
       │
       ▼
Stripe sends webhook → POST /api/stripe/webhook
  → Marks order PAID
  → Sends confirmation email to customer
  → Calls CJ Dropshipping API to place order
  → Stores supplier order ID
  → Marks fulfillment SUBMITTED_TO_SUPPLIER
       │
       ▼
Admin monitors at /admin/orders
  → Updates tracking when received
  → Sends shipping notification email
```
