---
docId: "issueflow.prd.v1.manual-boundary"
title: "Manual actions versus allowed automatic behavior"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "3"
  - "3.1"
  - "4.7"
  - "4.8"
  - "4.14"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Worker"
  - "ActivityLog"
  - "Notification"
keywords:
  - "manual-first"
  - "automatic"
  - "status"
  - "reminders"
  - "worker"
questions:
  - "What may IssueFlow change automatically?"
  - "Can a background job change issue status, assignee, or priority?"
  - "Are due-date reminders allowed to edit the issue?"
  - "Does completing every subtask mark the parent Done?"
---

IssueFlow principles are manual-first, minimalist, consistent, fast, secure, self-hosted, reliable, and transparent. Transparent means the system records who changed what and when. Reliable means data survives container restarts. Secure means every operation checks permissions.

People perform these actions themselves: create issue, assign issue, change status, set priority, add tags, set due date, add comments, create subtasks, add dependencies, upload attachments, complete issue, and delete issue. Delete requires confirmation.

The system may do only these things on its own: generate the issue ID, record timestamps, record activity, calculate statistics, send due-date reminders from user-entered dates, and persist data.

No background process may autonomously change an issue's status, assignee, priority, or any other business field. Dragging a Kanban card is a user action. The board must not move cards by itself. Parent completion statistics are calculated automatically, and the parent issue is never automatically marked Done. Dependencies never change issue status. Dashboard values are calculated from existing records and must not create or modify issues. Due-date reminders use dates people entered, and notifications must not change the underlying issue.

Activity entries are produced by the server. The client must not be trusted to supply the activity record.
