---
docId: "issueflow.prd.v1.issue-details"
title: "Issue detail layout and editable properties"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.6"
  - "5.4"
  - "11"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
keywords:
  - "issue details"
  - "two-column"
  - "properties panel"
questions:
  - "What does the issue detail page show?"
  - "Which properties are editable?"
  - "How does issue detail behave on mobile?"
  - "How fast should issue detail load?"
---

The issue detail view uses a clean two-column layout. Issue Details is a P0 screen. Create Issue is also P0. The initial target is issue detail loading under 1 second under normal test conditions.

Main content contains the issue title, Markdown description, subtasks, dependencies, attachments, comments, and activity history.

The properties panel contains status, priority, assignee, reporter, project, tags, due date, and issue type.

All properties are editable through clear, direct interactions, subject to permissions. On mobile, issue detail panels stack vertically.

The properties panel lists project as editable. The PRD does not specify a move-between-projects operation, what happens to the issue key if the project changes, or whether project-specific tags survive that move.
