---
docId: "issueflow.prd.v1.docker"
title: "Docker Compose services, volumes, bootstrap, and install path"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "6.3"
  - "14"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Docker"
  - "PostgreSQL"
  - "Worker"
keywords:
  - "docker compose"
  - "localhost:3000"
  - "migrations"
  - "bootstrap admin"
questions:
  - "How is IssueFlow installed?"
  - "Which containers are required?"
  - "Which data survives a restart?"
  - "Is PostgreSQL published on the host?"
---

Users install IssueFlow with Docker Desktop or Docker Engine plus Docker Compose. They do not install Node.js, npm, or PostgreSQL on the host. The definition of done requires that Docker installation works without host Node.js or PostgreSQL, and that migrations work on a fresh database and on an existing one.

Install:

```bash
git clone <repository-url>
cd issueflow
cp .env.example .env
docker compose up --build
```

Startup order: start PostgreSQL; wait for database health; run database migrations; initialize required application data; start the application; start the background worker.

Containers:

| Container | Responsibility |
|---|---|
| app | Main web application |
| db | PostgreSQL database |
| migrate | Database migrations and bootstrap |
| worker | Reminder processing |

Persistent volumes are `postgres_data` and `attachments`. The database is not publicly exposed by default. The application is at `http://localhost:3000`.

A secure initial admin is created by a documented bootstrap process. Default production credentials are not hardcoded. For LAN access, operators may publish the application port and restrict it with a firewall. Public internet deployment requires HTTPS and additional security configuration.

Roadmap phase 1 is Docker, database, migrations, and the app foundation, priority P0. The acceptance scenario starts with an admin bringing the stack up with Docker Compose and ends with a container restart that keeps application data.
