## Event Management System - Bun & Prisma Backend
A backend for an event management system built with Bun, Express, and Postgres (Neon DB) using Prisma ORM. Supports user authentication, event creation/management, registrations with capacity limits, filtering, cancellations, and admin approvals.
Features

User registration/login with JWT (includes email field).
Event CRUD (create/update/delete) with creator or admin permissions.
Admin approval/rejection of events.
Register/cancel for approved events with capacity checks.
Filter events by date/location.
Date validation (events after September 16, 2025, 01:02 PM IST).

Project Structure
event-management-bun/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   └── registrations.ts
│   ├── middleware/
│   │   └── auth.ts
│   └── db.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md

Setup

Install Bun: curl -fsSL https://bun.sh/install | bash.
Clone Repo: git clone <your-repo> (cd into event-management-bun/).
Install Dependencies: bun install.
Set Up Neon DB:
Create database at neon.tech.
Update .env with DATABASE_URL and JWT_SECRET.


Initialize Prisma:bunx prisma migrate dev --name init
bunx prisma generate


Run Server:bun run dev

Server runs at http://localhost:3000.
Test with Postman:
Register: POST /api/auth/register { "username": "test", "password": "pass", "email": "test@example.com" }
Login: POST /api/auth/login { "username": "test", "password": "pass" } → Get JWT.
Use Authorization: Bearer <token> for protected routes.
Create Event: POST /api/events { "title": "Concert", "date": "2025-09-17", "time": "18:00", "location": "Mumbai", "capacity": 100 }
Approve Event: PUT /api/events/1/approve { "status": "approved" } (admin only)
Register: POST /api/events/1/register
Filter Events: GET /api/events?date=2025-09-17&location=Mumbai



Notes

Admin Setup: Manually insert admin user in Neon DB:INSERT INTO "User" (username, password, email, role) VALUES ('admin', '$2b$10$...', 'admin@example.com', 'admin');

Generate hash: bun run -e "import bcrypt from 'bcrypt'; console.log(await bcrypt.hash('adminpass', 10))".
Future Enhancements: Add input validation (Zod), logging, tests (Vitest), React frontend.
Deployment: Use Bun-compatible platforms (e.g., Railway) with Neon DB.
Schema Fix: Corrected EventStatus to Status in schema.prisma.

For issues, check server logs or Neon console.