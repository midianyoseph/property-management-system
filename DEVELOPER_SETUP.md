# Betoch PMS — Developer Setup Guide

## Project Overview

Betoch is a property management system for Ethiopian 
landlords and tenants. It consists of three applications:

| App | Port | Description |
|-----|------|-------------|
| `apps/api` | 3001 | Express REST API |
| `apps/admin-portal` | 3000 | Admin Next.js portal |
| `apps/tenant-portal` | 3002 | Tenant Next.js portal |

## Prerequisites

Make sure you have these installed before starting:

- Node.js 18 or higher
- npm 9 or higher
- Git

Check your versions:
```bash
node --version
npm --version
```

## First Time Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd property-management-system
```

### 2. Install all dependencies

Run this from the root of the monorepo:

```bash
npm install
```

This installs dependencies for all three apps at once.

### 3. Set up environment variables

You need three separate .env files. 
**Never commit these files to git.**

#### API (apps/api/.env)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Server
PORT=3001
HOST=0.0.0.0

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# URLs
TENANT_PORTAL_URL=http://localhost:3002
```

#### Admin Portal (apps/admin-portal/.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Tenant Portal (apps/tenant-portal/.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Where to find these values

1. Go to your Supabase project dashboard
2. Click Settings → API
3. Copy:
   - Project URL → use for SUPABASE_URL and 
     NEXT_PUBLIC_SUPABASE_URL
   - anon public key → use for NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role secret key → use for SUPABASE_SERVICE_KEY
     ⚠️ Never expose the service_role key in frontend code

## Daily Development

Every time you open the project, run each app 
in a separate terminal tab.

### Terminal 1 — API

```bash
cd apps/api
npm run dev
```

Expected output:
```
API listening on http://0.0.0.0:3001
```

### Terminal 2 — Admin Portal

```bash
cd apps/admin-portal
npm run dev
```

Expected output:
```
▲ Next.js 14
- Local: http://localhost:3000
✓ Ready
```

### Terminal 3 — Tenant Portal

```bash
cd apps/tenant-portal
npm run dev
```

Expected output:
```
▲ Next.js 14
- Local: http://localhost:3002
✓ Ready
```

## Test Accounts

### Admin account
- URL: http://localhost:3000/login
- Email: admin@test.com
- Password: Admin1234!

### Tenant account
- URL: http://localhost:3002/login
- Email: yosephmidian@gmail.com
- Password: (check with Midian — set via profile page)

## Common Errors

### "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"

Your API .env file is missing or has wrong variable names.

Check:
1. File exists at apps/api/.env (not .env.local)
2. Variable is named SUPABASE_SERVICE_KEY 
   (not SUPABASE_SERVICE_ROLE_KEY)
3. No spaces around the = sign
4. No quotes around values

```env
# Correct
SUPABASE_URL=https://abc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# Wrong
SUPABASE_URL = https://abc.supabase.co
SUPABASE_SERVICE_KEY="eyJhbGc..."
```

### "Cannot find module 'resend'"

```bash
cd apps/api
npm install
```

### Port already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3002
lsof -ti:3002 | xargs kill -9
```

### Changes not showing up

```bash
# Clear Next.js cache
cd apps/admin-portal && rm -rf .next
cd apps/tenant-portal && rm -rf .next

# Restart the dev server
npm run dev
```

## Project Structure

```
property-management-system/
├── apps/
│   ├── api/                    # Express REST API
│   │   ├── src/
│   │   │   ├── main.ts         # Entry point
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Auth, error handling
│   │   │   └── lib/            # Supabase client
│   │   └── .env                # API environment vars
│   │
│   ├── admin-portal/           # Admin Next.js app (port 3000)
│   │   ├── src/app/
│   │   └── .env.local          # Admin environment vars
│   │
│   └── tenant-portal/          # Tenant Next.js app (port 3002)
│       ├── src/app/
│       ├── messages/           # i18n translations (en, am)
│       └── .env.local          # Tenant environment vars
│
├── packages/
│   └── types/                  # Shared TypeScript types
│
└── DEVELOPER_SETUP.md          # This file
```

## API Overview

All API endpoints require a Bearer token from 
Supabase Auth except /health.

```
GET  /health                    No auth required

# Properties
GET  /api/properties            Admin only
POST /api/properties            Admin only

# Tenants
GET  /api/tenants/me            Tenant + Admin
PATCH /api/tenants/:id/profile  Tenant only

# Leases
GET  /api/leases/mine           Tenant only

# Invitations (tenant onboarding)
POST /api/invitations           Admin only
POST /api/invitations/:id/activate  Admin only

# Invoices
GET  /api/invoices/mine         Tenant only

# Payments
GET  /api/payments/mine         Tenant only

# Maintenance
GET  /api/maintenance           Tenant + Admin
POST /api/maintenance           Tenant only

# Documents
GET  /api/lease-documents       Tenant + Admin
GET  /api/lease-documents/:id/download  Tenant + Admin
```

## Getting Auth Tokens for API Testing

### In Postman

1. Create a POST request to:
   https://YOUR_SUPABASE_URL/auth/v1/token?grant_type=password

2. Add headers:
   - apikey: YOUR_ANON_KEY
   - Content-Type: application/json

3. Body:
```json
{
  "email": "admin@test.com",
  "password": "Admin1234!"
}
```

4. Copy the access_token from the response

5. Use it as: Authorization: Bearer YOUR_TOKEN

## Database

The project uses Supabase (PostgreSQL).

Key tables:
- auth.users — Supabase managed authentication
- properties — Properties owned by admins
- units — Units within properties
- tenants — Tenant business data
- lease_invitations — Pre-lease invitation flow
- leases — Active lease agreements
- lease_documents — PDF documents for leases
- invoices — Monthly rent invoices
- payments — Payment records
- maintenance_tickets — Maintenance requests
- maintenance_comments — Comments on tickets

## Workflow: Adding a New Tenant

1. Admin creates invitation via Postman or admin portal:
   POST /api/invitations

2. Tenant receives email with lease details

3. Admin activates after lease is signed:
   POST /api/invitations/:id/activate

4. Tenant receives welcome email with temp password

5. Tenant logs into http://localhost:3002 and 
   changes password in Profile page
