---
docId: "issueflow.prd.v1.discovery"
title: "All Issues, My Issues, search, sort, and saved filters"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.4"
  - "4.13"
  - "5.3"
  - "11"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "SavedFilter"
keywords:
  - "search"
  - "filters"
  - "pagination"
  - "saved filters"
  - "All Issues"
questions:
  - "How do users find issues?"
  - "Which fields can be searched, filtered, and sorted?"
  - "What saved filters are listed as examples?"
  - "Are saved filters shared?"
---

All Issues is the primary discovery screen and is P0. My Issues is also P0. Saved Filters as a screen is P1. Search and filters are roadmap phase 5, priority P0.

The All Issues page shows issues in a clean, configurable table. Users search by issue key and title. Users filter by project, status, priority, assignee, tags, and due date. Users sort by creation date, update date, priority, and due date. The page has pagination, configurable visible columns, saved filters, and explicit selection for bulk actions.

Search supports issue key and title. The same filter fields apply. Users can save frequently used filter combinations. Example saved filters are My Open Issues, Critical Bugs, Blocked Issues, Overdue Issues, and Issues Due This Week.

The initial target for a typical issue search is under 1 second under normal test conditions, at a data target of 50,000 or more issues.

The PRD does not say whether saved filters belong to one user or are shared, what JSON shape a filter uses, or whether column configuration is stored per user. It does not require full-text search of descriptions or comments. Search is key and title.
