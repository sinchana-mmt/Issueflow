---
docId: "issueflow.prd.v1.relationships"
title: "Relationships between IssueFlow entities"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4"
  - "7"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "Project"
  - "User"
  - "Dependency"
  - "ActivityLog"
keywords:
  - "relationships"
  - "entity graph"
  - "parent issue"
  - "membership"
questions:
  - "How are IssueFlow entities related?"
  - "What is the parent of a subtask?"
  - "What writes activity and notifications?"
---

Relationship statements that the PRD supports:

- A Project has many Issues. An Issue belongs to one Project.
- A Project has many Tags. A Tag belongs to one Project.
- An Issue has many Tags through IssueTag. A Tag can label many Issues in its project.
- A User joins a Project through ProjectMember.
- An Issue has one optional assignee User and one reporter User.
- An Issue has one optional parent Issue. That parent relationship is the subtask structure. The child has its own issue key.
- An Issue has many Comments, Attachments, ActivityLog rows, and Dependency rows.
- A Dependency connects two Issues and has a relationship type.
- A Notification is addressed to a User and refers to an issue event. Creating a notification does not update issue status, assignee, or priority.
- A SavedFilter belongs to the search feature. The PRD does not say it belongs to a user or a project.
- The application server writes ActivityLog in the same transaction as the issue update that caused it.
- The worker writes due-date Notification rows from dates stored on Issues.

Self-dependencies are forbidden. Circular blocking relationships are forbidden. The blocks relationship is directional: Is blocked by is the inverse representation of Blocks.
