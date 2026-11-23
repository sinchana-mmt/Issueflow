# IssueFlow

Self-hosted issue tracker. Status, assignee, priority, and new issues change only when a person does it.

## Requirements

Docker Engine and Docker Compose. Nothing else is installed on the host.

## Install

```powershell
copy .env.example .env
```

Set these before the first start:

- `POSTGRES_PASSWORD` and the same password inside `DATABASE_URL`
- `BETTER_AUTH_SECRET` (at least 32 random characters)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`
- `BETTER_AUTH_URL` to the exact address people use in the browser, including the port

Then:

```powershell
docker compose up --build -d
```

Open `http://localhost:3000` and sign in with the admin account. The first startup creates that account only when no active admin exists. There is no public registration.

The database port is not published. The app listens on port 3000.

## What runs

- `db` — PostgreSQL 17
- `migrate` — applies migrations, then creates the first admin
- `app` — Next.js on port 3000
- `worker` — due reminders and the daily backup

Attachments live on the `attachments` volume. Backups live on the `backups` volume. The database lives on `postgres_data`.

## Backups

The worker writes a SQL dump and an attachments archive every day at 02:15 UTC, and keeps the latest 7 of each. Run one immediately:

```powershell
docker compose exec worker npm run backup
```

Copy them out:

```powershell
docker compose cp worker:/data/backups ./backups
```

## Restore

Stop the app and worker, restore the database, then restore attachments.

```powershell
docker compose stop app worker
Get-Content .\backups\issueflow-YYYY-MM-DD.sql -Raw | docker compose exec -T db psql -U issueflow -d issueflow
docker compose cp .\backups\attachments-YYYY-MM-DD.tar.gz worker:/tmp/attachments.tar.gz
docker compose exec worker sh -c "mkdir -p /data/attachments && tar -xzf /tmp/attachments.tar.gz -C /data/attachments"
docker compose start app worker
```

Use the Postgres user and database from `.env` if you changed them.

## Reminders

Reminders are in-app only. They notify the assignee and the reporter when a due date is tomorrow, today, or overdue in the timezone from Settings. They do not change status, assignee, or priority.

The default schedule is every 15 minutes. Run the check once:

```powershell
docker compose exec app npx tsx -e "import { runDueReminders } from './src/server/reminders.ts'; const result = await runDueReminders(); console.log(result)"
```

## Local checks

Unit tests do not need Docker:

```powershell
npm test
```
