---
docId: "issueflow.prd.v1.kanban"
title: "Kanban board columns, drag-and-drop, and card order"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.5"
  - "6.2"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "Kanban"
keywords:
  - "kanban"
  - "drag and drop"
  - "dnd-kit"
  - "status columns"
questions:
  - "What columns does the Kanban board have?"
  - "What does dragging a card do?"
  - "What does a card show?"
  - "Does the board reorder cards by itself?"
---

The Kanban board displays issues organized by status. The Board screen is P0. Roadmap phase 6 is the Kanban board, priority P0. Drag-and-drop uses dnd-kit.

Default columns, in order, are Backlog, To Do, In Progress, In Review, Blocked, and Done. These names match the default statuses.

Requirements: drag-and-drop issue cards; status changes that a person initiates; cards show title, issue key, priority, assignee, and tags; filter by project, assignee, priority, and tags; open issue details by selecting a card; persist card ordering; give clear feedback after a successful status update.

Dragging a card is a user action. The application must not move cards automatically. On smaller screens the board supports horizontal scrolling.

The PRD does not say whether card order is shared by the project or private to the user, how concurrent drags are resolved, or whether columns can be renamed or hidden in v1.
