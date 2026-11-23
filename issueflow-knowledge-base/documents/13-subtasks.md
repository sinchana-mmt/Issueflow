---
docId: "issueflow.prd.v1.subtasks"
title: "Subtasks, their own keys, and parent completion statistics"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.7"
  - "8.1"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "Subtask"
keywords:
  - "subtasks"
  - "parent issue"
  - "completion statistics"
questions:
  - "How do subtasks work?"
  - "Does a subtask get its own issue key?"
  - "Does finishing all subtasks complete the parent?"
  - "What is the subtasks API?"
---

Users manually create subtasks under a parent issue. The parent is stored as the parent issue reference on the child. Each subtask receives its own issue key. Subtasks have their own status, priority, assignee, and due date. Users can edit and delete subtasks. The parent issue displays subtask completion statistics.

Example from the PRD:

```text
ECOM-101  Implement checkout
  ECOM-102  Create checkout UI
  ECOM-103  Integrate payment API
  ECOM-104  Add payment validation
```

Parent completion statistics are calculated automatically. The parent issue is never automatically marked Done.

The API group for subtasks is `/issues/:id/subtasks` under the `/api/v1` prefix. Roadmap phase 8 covers subtasks and dependencies at priority P0.

The PRD does not set a nesting depth limit, and it does not say whether subtasks appear as normal rows on All Issues and on the Kanban board.
