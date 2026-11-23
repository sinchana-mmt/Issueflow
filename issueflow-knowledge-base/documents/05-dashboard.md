---
docId: "issueflow.prd.v1.dashboard"
title: "Overview dashboard contents and calculation rules"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.1"
  - "5.3"
  - "11"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Dashboard"
  - "Issue"
  - "Notification"
keywords:
  - "dashboard"
  - "overview"
  - "statistics"
  - "deadlines"
questions:
  - "What does the IssueFlow dashboard show?"
  - "Can the dashboard create or edit issues?"
  - "How fast should the dashboard load?"
---

The dashboard is a concise overview of project activity and assigned work. The Overview screen is P0. Dashboard values are calculated from existing records. The dashboard must not create or modify issues.

Required values and lists:

- Total active issues.
- Issues assigned to the current user.
- Issues in progress.
- Blocked issues.
- Completed issues.
- Upcoming deadlines.
- Recently updated issues.
- My assigned issues.
- Quick access to projects.
- Notifications and reminders.

The initial performance target is dashboard loading under 2 seconds under normal test conditions, for an initial scale of 10 to 20 concurrent users and 50,000 or more issues. These targets are validation goals, not guaranteed limits. The roadmap places dashboard and reminders in phase 10, priority P1, while the Overview screen itself is P0. The acceptance scenario requires the dashboard to reflect updated issue data before the MVP is functionally complete.
