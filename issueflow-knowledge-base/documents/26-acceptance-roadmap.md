---
docId: "issueflow.prd.v1.acceptance"
title: "Performance targets, acceptance scenario, roadmap, and definition of done"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "5.3"
  - "11"
  - "12"
  - "13"
  - "14"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "IssueFlow"
keywords:
  - "acceptance"
  - "definition of done"
  - "roadmap"
  - "P0"
  - "P1"
  - "performance"
questions:
  - "When is the IssueFlow MVP functionally complete?"
  - "What are the performance targets?"
  - "What is the difference between P0 and P1?"
  - "What is the build order?"
---

Initial performance targets, to be validated on representative hardware and data, are: dashboard load under 2 seconds; issue detail load under 1 second; typical issue search under 1 second; typical API response under 500 ms excluding file transfers; 10 to 20 concurrent users; 50,000 or more issues; 20 MB default attachment size; data kept across container restarts; current Chrome, Firefox, Edge, and Safari.

P0 screens are essential for the first usable MVP. P1 screens complete the planned MVP experience. P1 on the roadmap is sequence, and the completion bar still includes that work.

The MVP is functionally complete when this scenario succeeds:

1. An admin starts IssueFlow with Docker Compose.
2. The admin logs in.
3. The admin creates a project.
4. The admin creates team members.
5. The admin adds members to the project.
6. A member manually creates an issue.
7. The application generates a unique issue key.
8. The member sets status, priority, assignee, tags, and due date.
9. The member creates subtasks.
10. The member adds issue dependencies.
11. The member adds a Markdown comment.
12. The member uploads an attachment.
13. The member manually moves the issue across Kanban columns.
14. The activity history records the changes.
15. The dashboard reflects the updated issue data.
16. Due-date reminders appear when appropriate.
17. The member exports permitted issue data.
18. The containers restart without losing application data.

Tests also verify that unauthorized users cannot access or modify restricted resources.

Roadmap phases: (1) Docker, database, migrations, app foundation, P0. (2) Authentication, users, roles, permissions, P0. (3) Projects and membership, P0. (4) Issue CRUD and issue details, P0. (5) Search, filters, tags, saved filters, P0. (6) Kanban, P0. (7) Comments, activity, Markdown, P0. (8) Subtasks and dependencies, P0. (9) Attachments, P1. (10) Dashboard and reminders, P1. (11) Export and backup/restore, P1. (12) Testing, security review, and production packaging, P0.

The MVP is done when core features work end to end; the UI matches the dark design; every work-management change is user-initiated; role and project permissions are enforced; important issue changes are recorded; attachments are securely stored; data persists across restarts; Docker install needs no host Node.js or PostgreSQL; migrations work on fresh and existing databases; automated tests cover critical workflows; backup and restore are documented and tested.

Vitest covers unit tests. Playwright covers end-to-end tests. The PRD does not set a coverage percentage.
