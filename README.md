# TuFund - Crowdfunding Platform

A production-ready crowdfunding web application built with Next.js 14+ and Prisma, designed to help users raise funds via Paystack and international cards.

## Features

- 🔐 **Authentication**: Email/password authentication via NextAuth with bcrypt
- 💳 **Paystack Integration**: Accept donations via Paystack (cards, bank transfers, mobile money)
- 💳 **Card Payments**: Accept international donations via Stripe
- 📊 **Live Updates**: Campaign progress updates with polling
- 📄 **PDF Reports**: Generate and download campaign reports
- 📧 **Email Notifications**: Automated email confirmations for donations
- 🎨 **Modern UI**: Beautiful, responsive design with dark/light mode
- 🔒 **Security**: Input validation, fraud detection, secure password hashing
- 📱 **Mobile-First**: Fully responsive, works on screens as small as 320px

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide React icons
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Neon PostgreSQL (serverless Postgres)
- **Authentication**: NextAuth.js with credentials provider
- **Payments**: Paystack, Stripe
- **Forms**: React Hook Form, Zod validation
- **PDF Generation**: @react-pdf/renderer
- **Email**: Resend
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+ and npm/yarn
- Neon PostgreSQL account (free tier available)
- Paystack account and API keys
- Stripe account and API keys
- Resend account for emails

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd tufund
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_CALLBACK_URL=http://localhost:3000/api/donate/paystack/callback

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@your-domain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and copy your connection string
3. Add it to `.env.local` as `DATABASE_URL`
4. Run migrations:

```bash
npm run db:migrate
```

When prompted, name the migration: `init`

This will create all tables, enums, indexes, and triggers in your Neon database.

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tufund/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── campaign/          # Campaign view pages
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── campaign/         # Campaign-related components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility functions
│   ├── db/              # Database (Prisma)
│   │   ├── prisma.ts    # Prisma Client
│   │   └── queries.ts   # Database queries
│   ├── validations.ts    # Zod schemas
│   ├── utils.ts          # Helper functions
│   ├── paystack.ts       # Paystack integration
│   ├── email.ts          # Email functions
│   └── reports.ts        # PDF generation
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Key Features Implementation

### Authentication

- Email/password signup and login via NextAuth
- Password hashing with bcrypt
- Protected routes via middleware
- Session management with JWT

### Database

- Prisma ORM for type-safe database access
- Neon PostgreSQL (serverless, auto-scaling)
- Migrations for schema versioning
- Connection pooling for performance

### Campaign Creation

- Multi-step form with validation
- Rich text editor (React Quill)
- Image upload to local storage (can be replaced with S3/Cloudinary)
- Automatic slug generation
- Category selection

### Donations

- **Paystack**: Payment initialization with redirect and webhook handling
- **Stripe**: Checkout session with webhook verification
- Real-time campaign amount updates (via database triggers)
- Email confirmations to donors
- Fraud detection (IP-based, can be enhanced with Redis)

### Live Updates

- Polling-based updates for campaign progress (every 10 seconds)
- Live donation feed
- Automatic UI updates

### Reports

- PDF generation with campaign details
- Donation summary
- Downloadable reports

## Database Management

### Creating Migrations

When you modify `prisma/schema.prisma`:

```bash
npm run db:migrate
```

This creates a new migration file and applies it to your database.

### Viewing Database

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555` for visual database management.

### Other Commands

- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate:deploy` - Deploy migrations (production)
- `npm run db:push` - Push schema changes without migration (dev only)

## Security Features

- Input validation with Zod
- HTML sanitization with DOMPurify
- CSRF protection (Next.js built-in)
- Secure headers configuration
- Webhook signature verification
- Atomic database transactions
- Password hashing with bcrypt
- Type-safe database queries with Prisma

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables (including `DATABASE_URL`)
4. Run migrations in production: `npm run db:migrate:deploy`
5. Deploy

### Environment Variables for Production

Make sure to update:
- `PAYSTACK_SECRET_KEY` to your production secret key
- `PAYSTACK_CALLBACK_URL` to your production domain
- `NEXT_PUBLIC_APP_URL` to your production URL
- `DATABASE_URL` with production database connection string
- `NEXTAUTH_URL` to your production URL
- Stripe webhook URL in Stripe dashboard

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/donate/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Paystack Testing

For testing Paystack:

1. Use test credentials from Safaricom Developer Portal
2. Test phone numbers: 254708374149, 254712345678
3. Use test amounts (minimum KSh 1)
4. Monitor callbacks in your application logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
