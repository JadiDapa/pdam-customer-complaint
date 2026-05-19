# CLAUDE.md

## What This Project Is

A water supply company (PDAM) complaint management system. Customers submit water disturbance complaints; admins assign technicians, schedule execution, and upload follow-up evidence. Leads have read-only oversight across everything.

---

## Commands

```bash
npm run dev                   # Dev server (port 3000)
npm run build                 # Production build
npm run lint                  # ESLint

npx prisma migrate dev        # Run migrations
npx prisma generate           # Regenerate client — run after any .prisma change
npx prisma db seed            # Seed (tsx prisma/seed.ts)
npx prisma studio             # Prisma GUI
```

No test runner configured.

---

## Stack

Next.js 15 (App Router) · TypeScript · PostgreSQL · Prisma · Clerk (v16) · Tailwind · shadcn/ui · TanStack React Query · React Hook Form + Zod · Sonner · next-themes

---

## Folder Structure

```
app/
  (auth)/               # Sign-in, sign-up pages (Clerk)
  (dashboard)/          # ADMIN + LEAD layout — sidebar, full data tables, action panels
  (root)/               # CUSTOMER layout — own complaints only, portal-style
  actions/              # Server Actions ("use server") — call services, revalidate paths
  api/images/[filename] # Streams uploaded images (public, no auth check)

servers/
  services/             # All business logic and DB operations — nowhere else
  validators/           # Zod schemas — input validation and DTO types

components/
  ui/                   # shadcn/ui — never edit
  root/                 # Domain components (shared across role layouts)

lib/                    # Prisma singleton, cn(), sidebar-menu, misc utils
providers/              # React context providers (wrap in root layout)
hooks/                  # use-mobile.tsx; add new hooks here as needed
prisma/
  schema/               # Split .prisma files by domain (see Prisma section)
  seed.ts               # Seed script
uploads/images/         # Local image storage — UUID filenames
proxy.ts                # Clerk auth middleware (replaces middleware.ts in Clerk v16)
generated/prisma/       # Auto-generated Prisma client — never edit manually
```

---

## Route Groups & Access

### `(auth)`

Public. Sign-in and sign-up via Clerk.

### `(dashboard)` — ADMIN and LEAD

Full system view. Shared layout (sidebar).

| Route              | Description                                 |
| ------------------ | ------------------------------------------- |
| `/complaints`      | All complaints table — sortable, searchable |
| `/complaints/[id]` | Complaint detail + action panel             |
| `/customers`       | Customer list                               |

### `(root)` — CUSTOMER

Scoped to the logged-in customer's data only. Different layout from dashboard.

| Route              | Description                                     |
| ------------------ | ----------------------------------------------- |
| `/`                | Active complaints, past complaints, stats cards |
| `/complaints/[id]` | Own complaint detail + cancel option            |
| `/complaints/new`  | Submit new complaint form                       |

`proxy.ts` handles redirects — unauthenticated users go to `/sign-in`; customers hitting dashboard routes get bounced back, and vice versa.

---

## Roles

| Role       | Can Do                                                               |
| ---------- | -------------------------------------------------------------------- |
| `ADMIN`    | Full access — schedule, assign technician, upload evidence, view all |
| `LEAD`     | Read-only — views everything, triggers no mutations                  |
| `CUSTOMER` | Own complaints only — submit, view, cancel (PENDING only)            |

`Technician` is a **data model only** — no login, no Clerk account. Admins assign from a technician list.

Role-based navigation filtered via `filterMenuByRole()` in `lib/sidebar-menu.ts`.

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

- `disturbanceType`: enum — `KEBOCORAN_PIPA`, `AIR_TIDAK_MENGALIR`, `AIR_KERUH`, `TEKANAN_RENDAH`, `PIPA_PECAH`, `METER_RUSAK`, `LAINNYA`
- `status`: enum — `PENDING`, `IN_PROGRESS`, `RESOLVED`
- Full enum definitions in `prisma/schema/complaint.prisma`

---

## Prisma

Schemas split by domain under `prisma/schema/`:
`user.prisma` · `customer.prisma` · `technician.prisma` · `complaint.prisma` · `image.prisma`

`prisma.config.ts` points Prisma at this folder.

**After any schema edit:** `npx prisma generate` → `npx prisma migrate dev`

Import types from `@/generated/prisma`, **not** `@prisma/client`.

---

## Server Actions & Services

```
Component → Server Action (app/actions/) → Service (servers/services/) → Prisma
```

- Actions are thin: validate input, call service, call `revalidatePath()`
- Services own all DB logic — never put Prisma calls in actions or components
- Mutations on LEAD role must be blocked at the action level

---

## File Uploads

- Stored locally in `uploads/images/` with UUID filenames (no cloud storage)
- Written in `ComplaintService.create()` and `ComplaintService.submitEvidence()`
- Served via `app/api/images/[filename]/route.ts` — public, path-traversal protected
- Server Actions body limit: 20 MB (`next.config.ts`)
- Evidence upload requires **at least 1 photo** before resolving a complaint

---

## UI Conventions

- **Icons**: `lucide-react` only
- **Conditional classes**: `cn()` from `lib/utils.ts`
- **Add shadcn component**: `npx shadcn@latest add <component>`
- **Toasts**: `toast.success()` / `toast.error()` via Sonner
- **Dark mode**: `next-themes`
- Never edit files under `components/ui/`

---

## Environment Variables

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```
