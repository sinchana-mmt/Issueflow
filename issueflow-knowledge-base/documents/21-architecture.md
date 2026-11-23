---
docId: "issueflow.prd.v1.architecture"
title: "Modular monolith, technology stack, and process split"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "6.1"
  - "6.2"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Nextjs"
  - "Prisma"
  - "PostgreSQL"
  - "BetterAuth"
  - "Worker"
keywords:
  - "modular monolith"
  - "Next.js"
  - "Prisma"
  - "PostgreSQL"
  - "pg-boss"
questions:
  - "What architecture does IssueFlow use?"
  - "What is the technology stack?"
  - "Which process runs reminders?"
  - "Where does business logic live?"
---

IssueFlow is a modular monolith. It is one deployable application, not a set of microservices. The main parts are a browser UI, a Next.js application that contains both the UI and the REST API, PostgreSQL, a separate worker process that uses the same application code and the same database, and persistent file storage for attachments.

Stack:

| Layer | Technology |
|---|---|
| Frontend | Next.js and TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Icons | Lucide |
| Backend | Next.js Route Handlers |
| API validation | Zod |
| Forms | React Hook Form |
| Authentication | Better Auth |
| ORM | Prisma |
| Database | PostgreSQL 17 |
| Kanban drag-and-drop | dnd-kit |
| Markdown editor | TipTap |
| Background jobs | pg-boss |
| File storage | Docker persistent volume |
| Unit testing | Vitest |
| E2E testing | Playwright |
| Containerization | Docker and Docker Compose |

Use compatible stable package versions, pin them in the lockfile, and keep the database, ORM, authentication adapter, and framework versions consistent.

Route handlers validate input, authenticate the user, check permissions, and call a service layer. Business logic is not implemented inside route handlers. The worker shares that service code so reminder behavior cannot drift from the web process. The worker still must not change business fields.
