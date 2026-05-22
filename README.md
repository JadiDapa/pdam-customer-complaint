# PDAM Customer Complaint Management System

A web-based complaint management system for water supply companies (PDAM). Customers submit water disturbance complaints; admins assign technicians, schedule execution, and upload follow-up evidence. Leads have read-only oversight across all data.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Clerk v7
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **Other**: next-themes, Recharts, TanStack Table, xlsx

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Database Setup

```bash
npx prisma migrate dev     # Run migrations
npx prisma db seed         # Seed initial data
```

### Running the App

```bash
npm run dev                # Development server (http://localhost:3000)
npm run build              # Production build
npm run start              # Start production server
npm run lint               # Run ESLint
```

---

## Roles & Access

| Role       | Access                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| `ADMIN`    | Full access — schedule, assign technicians, upload evidence, view all data |
| `LEAD`     | Read-only — views everything, no mutations                                 |
| `CUSTOMER` | Own complaints only — submit, view, and cancel (PENDING status only)       |

> `Technician` is a data model only — no login, no Clerk account. Admins assign technicians from a managed list.

---

## Complaint Lifecycle

```
[CUSTOMER submits]
      │
   PENDING  ◄─── Customer can cancel here only
      │
[ADMIN assigns technician + schedules date]
      │
  IN_PROGRESS
      │
[ADMIN uploads ≥1 evidence photo]
      │
   RESOLVED
```

### Disturbance Types

| Value                | Description       |
| -------------------- | ----------------- |
| `KEBOCORAN_PIPA`     | Pipe leakage      |
| `AIR_TIDAK_MENGALIR` | No water flow     |
| `AIR_KERUH`          | Murky/dirty water |
| `TEKANAN_RENDAH`     | Low water pressure|
| `PIPA_PECAH`         | Burst pipe        |
| `METER_RUSAK`        | Broken meter      |
| `LAINNYA`            | Other             |

---

## Routes

### `(auth)` — Public

| Route      | Description   |
| ---------- | ------------- |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |

### `(dashboard)` — ADMIN & LEAD

| Route              | Description                                 |
| ------------------ | ------------------------------------------- |
| `/complaints`      | All complaints table — sortable, searchable |
| `/complaints/[id]` | Complaint detail + admin action panel       |
| `/customers`       | Customer list                               |

### `(root)` — CUSTOMER

| Route              | Description                                     |
| ------------------ | ----------------------------------------------- |
| `/`                | Active complaints, past complaints, stats cards |
| `/complaints/[id]` | Own complaint detail + cancel option            |
| `/complaints/new`  | Submit new complaint form                       |

---

## Project Structure

```
app/
  (auth)/               # Sign-in, sign-up pages (Clerk)
  (dashboard)/          # Admin + Lead layout — sidebar, data tables, action panels
  (root)/               # Customer layout — own complaints only
  actions/              # Server Actions — call services, revalidate paths
  api/images/[filename] # Streams uploaded images

servers/
  services/             # All business logic and DB operations
  validators/           # Zod schemas — input validation and DTO types

components/
  ui/                   # shadcn/ui (do not edit)
  root/                 # Domain components shared across role layouts

lib/                    # Prisma singleton, cn(), sidebar menu, misc utils
providers/              # React context providers
hooks/                  # Custom React hooks
prisma/
  schema/               # Split .prisma files by domain
  seed.ts               # Seed script
uploads/images/         # Local image storage (UUID filenames)
proxy.ts                # Clerk auth middleware (Clerk v7)
generated/prisma/       # Auto-generated Prisma client (do not edit)
```

---

## Architecture

```
Component → Server Action (app/actions/) → Service (servers/services/) → Prisma → PostgreSQL
```

- **Server Actions** are thin: validate input, call a service, call `revalidatePath()`
- **Services** own all DB logic — Prisma calls never go in actions or components
- Mutations on `LEAD` role are blocked at the action level

---

## File Uploads

- Stored locally in `uploads/images/` with UUID filenames
- Served via `app/api/images/[filename]/route.ts` (public, path-traversal protected)
- Server Actions body limit: 20 MB
- Evidence upload requires at least 1 photo before a complaint can be resolved

---

## Prisma

Schema is split by domain under `prisma/schema/`:

- `user.prisma`
- `customer.prisma`
- `technician.prisma`
- `complaint.prisma`
- `image.prisma`

After any schema change:

```bash
npx prisma generate
npx prisma migrate dev
```

Import types from `@/generated/prisma`, not `@prisma/client`.
