---
docId: "issueflow.prd.v1.gaps"
title: "Decisions the PRD leaves open"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "2"
  - "4"
  - "5"
  - "7"
  - "8"
  - "9"
kind: "gap"
authority: "unspecified"
embed: true
priority: "P0"
status: "unspecified"
entities:
  - "Issue"
  - "Project"
  - "Notification"
  - "SavedFilter"
keywords:
  - "unspecified"
  - "open question"
  - "gap"
  - "permission matrix"
questions:
  - "What does the IssueFlow PRD leave unspecified?"
  - "Who can delete an issue?"
  - "Are saved filters private?"
  - "What timezone do due reminders use?"
  - "Can issues be nested more than one level?"
---

These items are absent from IssueFlow PRD v1.0. An answer grounded in this corpus says they are unspecified. It does not pick a behavior and call it a requirement.

GAP-01 Permission matrix. The role table names Admin, Manager, and Member capabilities. It does not map each action to a role. Unspecified actions include delete issue, archive project, export, change settings, edit another person's comment, and whether Admin can see a project without a ProjectMember row.

GAP-02 Workflows. Manager may "manage workflows." Complex workflow automation is a non-goal, and statuses are one fixed enum. No workflow designer is specified.

GAP-03 Archive and delete persistence. Issues can be archived, restored, and deleted with confirmation. Projects can be archived. The issue field list has no archived or deleted column. Cascade behavior for comments, attachments, subtasks, dependencies, and activity is unspecified. Project restore is unspecified.

GAP-04 Duplicate action. Duplicate issue is an action. Duplicates is also a link type. The copied field set is unspecified. Creating a Duplicates link as part of the action is unspecified.

GAP-05 Bulk actions. Selection and authorization are required. The operation list is unspecified.

GAP-06 Saved filters and columns. Ownership, sharing, and the stored filter shape are unspecified. Column configuration persistence is unspecified.

GAP-07 Kanban rank. Card order is persisted. Shared versus per-user order, and concurrent drag behavior, are unspecified. Custom columns are unspecified.

GAP-08 Issue keys after 999. Examples use three digits. Width, skipped numbers, and reuse after a rolled-back insert are unspecified. Project-key migration steps are unspecified.

GAP-09 Subtasks. Nesting depth is unspecified. Visibility of subtasks on All Issues and Kanban is unspecified.

GAP-10 Dependencies. Transitive cycle detection is unspecified. Symmetry of Relates to and Duplicates is unspecified. Only blocking cycles are mentioned.

GAP-11 Moving an issue. The detail panel lists project as editable. Moving projects, rewriting the issue key, and keeping project tags are unspecified.

GAP-12 Activity coverage. Recorded events are listed. Delete, duplicate, comment edit, and comment delete are not in that list.

GAP-13 Mentions. The mention notification exists only if mentions are implemented. Mention syntax and recipients are unspecified.

GAP-14 Reminder timing. Timezone, schedule, and behavior after a due date change are unspecified. Comment notification recipients are unspecified. Status and priority changes are not notification types.

GAP-15 Accounts. Password policy, session lifetime, multi-factor authentication, and the admin invite flow are unspecified. Bootstrap is "documented" and the mechanism is unspecified.

GAP-16 API details. Pagination, the error-code catalog beyond VALIDATION_ERROR, and whether Better Auth routes use the JSON envelope are unspecified.

GAP-17 Concurrency. updatedAt exists. Optimistic locking and lost-update behavior are unspecified.

GAP-18 Files. On-disk layout, orphan files, malware scanning, and ZIP contents are unspecified.

GAP-19 Audit. Important administrative actions are audited. The event list is unspecified.

GAP-20 Settings. The Settings screen is P1. Its contents are unspecified. Light theme, localization, and a keyboard path for drag-and-drop are not required by the PRD.

GAP-21 Search technology. Search is issue key and title. Description and comment search are not required. The index type is unspecified aside from "suitable indexes."
