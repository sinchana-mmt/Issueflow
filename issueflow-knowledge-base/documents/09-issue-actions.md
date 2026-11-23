---
docId: "issueflow.prd.v1.issue-actions"
title: "Issue actions, archive, restore, delete, and duplicate"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.3"
  - "4.4"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
keywords:
  - "create issue"
  - "archive"
  - "delete"
  - "duplicate"
  - "bulk actions"
questions:
  - "What actions can a user take on an issue?"
  - "Is delete the same as archive?"
  - "What does duplicating an issue mean?"
  - "Which bulk actions exist?"
---

Issue actions, each started by a person, are: create and edit an issue; change status and priority; assign a member; add or remove tags; set or update a due date; create subtasks; add dependencies; add comments; upload attachments; duplicate an issue; archive or restore an issue; delete an issue with confirmation.

Archive and delete are both required. Restore applies to an archived issue. The PRD does not define whether delete is a hard delete, whether activity and attachments are removed with the issue, or whether a project can be restored after archive.

"Duplicate an issue" is an action that creates another issue. "Duplicates" is also a dependency relationship type. The PRD does not say which fields the duplicate action copies, and it does not say that the action creates a Duplicates link.

The All Issues page requires explicit selection for bulk actions. Bulk actions apply only to issues the user selects and is authorized to modify. The PRD does not list the bulk operations.
