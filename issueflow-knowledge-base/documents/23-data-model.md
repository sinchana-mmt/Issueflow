---
docId: "issueflow.prd.v1.data-model"
title: "Database entities and transactional integrity rules"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "7"
  - "7.1"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "User"
  - "Project"
  - "Issue"
  - "Tag"
  - "Comment"
  - "ActivityLog"
  - "Attachment"
  - "Dependency"
  - "Notification"
  - "SavedFilter"
keywords:
  - "PostgreSQL"
  - "Prisma"
  - "entities"
  - "transactions"
  - "indexes"
questions:
  - "Which database entities does IssueFlow v1 include?"
  - "Which writes must share a transaction?"
  - "What integrity rules does the database enforce?"
---

The initial database model includes these entities:

| Entity | Purpose |
|---|---|
| User | User accounts and roles |
| Account | Authentication provider credentials |
| Session | Authentication sessions |
| Verification | Authentication verification tokens |
| Project | Project information |
| ProjectMember | Project membership |
| Issue | Main issue records |
| Tag | Project tags |
| IssueTag | Issue and tag relationship |
| Comment | Issue comments |
| ActivityLog | Issue history |
| Attachment | File metadata |
| Dependency | Issue relationships |
| Notification | User notifications |
| SavedFilter | Saved search filters |

User, Account, Session, and Verification follow the Better Auth adapter schema. Role is an application field on the user and must fit that schema.

Database rules:

1. Issue IDs are generated safely inside transactions.
2. Issue keys are unique.
3. Project and issue relationships are validated.
4. Circular blocking dependencies are rejected.
5. Activity records are written in the same transaction as the relevant issue update.
6. Deactivated users do not lose historical activity records.
7. Common filters have suitable database indexes.
8. Attachment bytes are stored outside the database. Metadata is in PostgreSQL.
9. Database backups and attachment backups are coordinated.

Common filters from the product are project, status, priority, assignee, tags, and due date, plus search by issue key and title, and sort by created, updated, priority, and due date. The PRD requires indexes for those filters and does not name the index list.
