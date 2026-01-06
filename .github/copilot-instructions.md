# Copilot Instructions for AI Agents

## Project Overview

This monorepo contains a full-stack AI-powered inventory forecasting and management system. It is split into two main parts:
- **Backend/**: Node.js (Express), PostgreSQL (via Prisma ORM), and Python (forecasting jobs)
- **frontend/**: Vite + React + TypeScript, Tailwind CSS, shadcn-ui

## Architecture & Data Flow
- **Backend** exposes RESTful APIs under `/api/*` (see `server.js` for dynamic route loading)
- **Controllers** in `Backend/controllers/` implement business logic, using **services** in `Backend/services/`
- **Prisma** models in `Backend/prisma/schema.prisma` define the database schema (users, products, sales, inventory, etc.)
- **Python forecasting** jobs run in `Backend/forecast2/` and may be triggered by Node.js jobs or cron
- **Frontend** consumes backend APIs, with pages in `frontend/src/pages/`
- **Socket.io** is used for real-time updates (see `Backend/sockets/`)

## Developer Workflows
- **Backend**
  - Start dev server: `npm run dev` (uses `nodemon`)
  - Run tests: `npm test` (uses `vitest`)
  - Run API endpoint tests: `node test-api-endpoints.cjs`
  - Prisma migrations: `npm run prisma:migrate`, generate: `npm run prisma:generate`, seed: `npm run seed`
- **Frontend**
  - Start dev server: `npm run dev` (in `frontend/`)
  - Install dependencies: `npm i`

## Project-Specific Conventions
- **Backend route loading** is dynamic: add new routes in `routes/` and update `server.js` loader
- **API endpoints** are versioned under `/api/` (e.g., `/api/products`)
- **Auth** uses JWT, with roles: SUPERADMIN, ADMIN, MANAGER, STAFF (see `schema.prisma`)
- **CORS** is configured for `http://localhost:5173` (frontend dev)
- **Environment variables** are managed via `.env` (not committed)
- **Testing**: Use `test-api-endpoints.cjs` for backend API smoke tests

## Integration Points
- **Prisma**: All DB access via `prismaClient.js` and models in `prisma/schema.prisma`
- **Python**: Forecasting logic in `forecast2/` (see `app.py`)
- **Socket.io**: Real-time events (see `sockets/index.js`)
- **MPESA**: Mobile payments integration (see `mpesaService.js` and `mpesaController.js`)

## Examples & Patterns
- Add a new API: create a controller, service, and route file, then register in `server.js`
- Add a new DB model: update `schema.prisma`, run `prisma:migrate`, update controllers/services
- Frontend pages: add to `frontend/src/pages/`, use hooks to fetch from backend

## References
- Key backend entry: `Backend/server.js`
- DB schema: `Backend/prisma/schema.prisma`
- API tests: `Backend/test-api-endpoints.cjs`
- Frontend entry: `frontend/src/`

---
For more, see `frontend/README.md` and backend source files. Update this file as project structure evolves.
