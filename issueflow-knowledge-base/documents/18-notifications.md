---
docId: "issueflow.prd.v1.notifications"
title: "In-app notifications and due-date reminders"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.14"
  - "1.2"
  - "6.1"
  - "6.3"
kind: "requirement"
authority: "normative"
embed: true
priority: "P1"
status: "specified"
entities:
  - "Notification"
  - "Worker"
  - "Issue"
keywords:
  - "notifications"
  - "reminders"
  - "due date"
  - "pg-boss"
  - "no email"
questions:
  - "Which notification types exist?"
  - "Are reminders sent by email?"
  - "What process sends due-date reminders?"
  - "Can a reminder change the issue?"
---

MVP notifications are in-app only. Email automation is a v1 non-goal. The Notifications screen is P1. Dashboard and reminders are roadmap phase 10, priority P1. The acceptance scenario requires due-date reminders to appear when appropriate.

Notification types are: issue assigned; comment added; user mentioned, if mentions are implemented; due tomorrow; due today; overdue issue.

The product provides a notification center, an unread count, mark one notification as read, and mark all as read. A periodic background job checks reminders. The job must prevent duplicate reminders for the same event and user. The worker is a separate container using the same application code and the same PostgreSQL database. Background jobs use pg-boss.

Due-date reminders use dates people entered. Notifications must not change the underlying issue. The Notification entity stores user notifications. The API group is `/notifications`.

The PRD does not define the recipient of a comment notification, the timezone that decides "tomorrow" and "today", the check interval, or whether a changed due date creates a new reminder after one was already sent. Status changes, priority changes, and dependency changes are not notification types.
