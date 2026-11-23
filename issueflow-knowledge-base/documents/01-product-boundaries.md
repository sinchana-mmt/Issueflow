---
docId: "issueflow.prd.v1.boundaries"
title: "IssueFlow product vision, goals, and v1 non-goals"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "1"
  - "1.1"
  - "1.2"
  - "15"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "IssueFlow"
keywords:
  - "vision"
  - "non-goals"
  - "self-hosted"
  - "manual-first"
questions:
  - "What is IssueFlow?"
  - "Who is IssueFlow for?"
  - "What is explicitly out of scope for version 1?"
  - "Does IssueFlow v1 integrate with GitHub, Slack, or Jira?"
---

IssueFlow v1.0 is a multi-user, self-hosted web application for small and medium-sized teams. Teams use it to create projects, manage issues, track progress, collaborate, and organize work. The tagline is "Your work. Your issues. Your control." The default appearance is a dark theme. Deployment is local, through Docker Compose.

The product is manual-first. A person creates each issue, assigns people, selects priority, updates status, adds tags, creates subtasks, and marks work complete. The system may generate issue IDs, record activity, calculate dashboard statistics, persist data, and send reminders from dates a person entered. It does not independently make project-management decisions.

Product goals:

1. Provide a premium, minimalist user interface.
2. Make issue creation and management fast and intuitive.
3. Support multiple team members with role-based permissions.
4. Provide essential project-management and collaboration functionality.
5. Keep application data on the user's own infrastructure.
6. Make installation and operation simple through Docker.
7. Avoid unnecessary automation and feature complexity.

Version 1 non-goals are: AI-generated issues or descriptions; automatic issue assignment; automatic status changes; automatic issue creation; GitHub or GitLab integrations; Slack integrations; external Jira synchronization; sprint planning and velocity tracking; time tracking and billing; public issue portals; complex workflow automation; email automation.

The intended product outcome is that a team can run its issue-tracking workflow in IssueFlow and keep full control of its data and decisions. The PRD directs a polished, practical issue tracker with a short feature set. Build priority is excellent UI, simple workflows, manual control, reliable issues/comments/attachments/activity, easy Docker deployment, and a maintainable codebase.
