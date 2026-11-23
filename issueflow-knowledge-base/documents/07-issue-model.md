---
docId: "issueflow.prd.v1.issue-model"
title: "Issue fields, types, statuses, and priorities"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.3"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "Project"
  - "User"
  - "Tag"
keywords:
  - "issue fields"
  - "bug"
  - "status"
  - "priority"
  - "reporter"
questions:
  - "What fields does an issue have?"
  - "Which issue fields are required?"
  - "What are the issue types, statuses, and priorities?"
  - "Who is the reporter?"
---

Issue management is the central module. Every action that changes issue data is explicitly initiated by a user.

Issue fields:

| Field | Type | Required |
|---|---|---|
| Issue title | Text | Yes |
| Description | Markdown | No |
| Project | Project reference | Yes |
| Issue key | Generated ID | Automatic |
| Issue type | Enum | Yes |
| Status | Enum | Yes |
| Priority | Enum | Yes |
| Assignee | User reference | No |
| Reporter | User reference | Automatic |
| Tags | Multiple references | No |
| Due date | Date | No |
| Parent issue | Issue reference | No |
| Created at | Timestamp | Automatic |
| Updated at | Timestamp | Automatic |

Issue types are Bug, Task, Story, Feature, and Research.

Default statuses are Backlog, To Do, In Progress, In Review, Blocked, and Done.

Priorities are Critical, High, Medium, and Low.

The reporter is set automatically. The PRD does not say the reporter can be edited. Assignee, tags, due date, description, and parent issue are optional. An issue references one project.

The field table does not include an archived flag, a deleted flag, or a board rank. Archive, restore, delete, and persisted card order are required behaviors elsewhere in the PRD, so the physical columns for those behaviors are an implementation detail the PRD leaves open.
