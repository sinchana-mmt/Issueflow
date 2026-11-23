---
docId: "issueflow.prd.v1.comments-activity"
title: "Comments, mentions, and server-written activity history"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.9"
  - "7.1"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Comment"
  - "ActivityLog"
  - "Issue"
keywords:
  - "comments"
  - "activity history"
  - "audit"
  - "markdown comments"
questions:
  - "What comment actions exist?"
  - "Which changes are written to activity history?"
  - "What does an activity record contain?"
  - "Can the client submit an activity record?"
---

Comments support add, edit own comments subject to permissions, and delete own comments subject to permissions. The UI shows author and timestamp. Comments support Markdown.

Activity history records these events: issue created; issue title or description changed; status changed; priority changed; assignee changed; tags changed; due date changed; comment added; attachment uploaded; dependency added or removed; issue archived or restored.

Each activity record includes the actor, the action, the previous value when applicable, the new value when applicable, and a timestamp. The server generates activity entries. They are not trusted from the client. Database rule 5: activity records are written in the same transaction as the relevant issue update. Database rule 6: deactivated users must not lose historical activity records.

The API groups are `/issues/:id/comments` and `/issues/:id/activity`. The entities are Comment and ActivityLog.

The activity list does not include issue deleted, issue duplicated, subtask added, or comment edited. The PRD does not say whether editing or deleting a comment writes activity. Mentions are optional: a notification type exists only if mentions are implemented.
