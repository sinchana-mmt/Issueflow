---
docId: "issueflow.prd.v1.entity-glossary"
title: "Entity glossary for IssueFlow"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "2"
  - "7"
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
  - "glossary"
  - "entities"
  - "domain model"
questions:
  - "What are the main IssueFlow entities?"
  - "Is a subtask a separate entity?"
  - "What does ProjectMember represent?"
---

User: an account with an application role of Admin, Manager, or Member. Inactive users cannot log in. Their past activity remains.

Account, Session, Verification: Better Auth adapter records for credentials, sessions, and verification tokens.

Project: a named body of work with a unique key, optional description, active or archived status, creator, and creation time.

ProjectMember: the membership of a user on a project. This is the permit that limits which projects a Manager or Member can see and change.

Issue: the unit of work. It belongs to one project, has a generated key, a type, a status, a priority, an optional assignee, an automatic reporter, optional tags, an optional due date, an optional parent issue, and created and updated timestamps. A subtask is an Issue with a parent issue. It is not a separate entity.

Tag: a named, colored label that belongs to one project.

IssueTag: the many-to-many link between an issue and a tag.

Comment: Markdown text on an issue, with author and timestamp.

ActivityLog: a server-written history row for an issue change, stored in the same transaction as that change.

Attachment: metadata for a file stored on the `attachments` volume. The file bytes are not in PostgreSQL.

Dependency: a relationship between two issues. Types are Blocks, Is blocked by (the inverse view of Blocks), Relates to, and Duplicates.

Notification: an in-app notice for a user. It does not modify the issue.

SavedFilter: a stored combination of the supported issue filters.

Worker: a process, not a table. It reads due dates and writes reminder notifications. It does not change issue business fields.
