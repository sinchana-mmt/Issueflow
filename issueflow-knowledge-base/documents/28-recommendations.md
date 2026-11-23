---
docId: "issueflow.prd.v1.recommendations"
title: "Advisory defaults for the open PRD decisions"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "2"
  - "3.1"
  - "4"
  - "7.1"
kind: "recommendation"
authority: "advisory"
embed: true
priority: "P0"
status: "proposed"
entities:
  - "Issue"
  - "ProjectMember"
  - "Worker"
keywords:
  - "recommendation"
  - "default"
  - "permission matrix"
  - "not a requirement"
questions:
  - "What implementation defaults are proposed for IssueFlow gaps?"
  - "Are these defaults part of the PRD?"
  - "How should blocking links be stored?"
---

These defaults are proposals for the gaps in `issueflow.prd.v1.gaps`. They are not requirements of IssueFlow PRD v1.0. A RAG answer labels them as proposals.

R-01 Authorization. Check application role and project membership on every protected operation. Admin has application-wide access. Manager and Member act only inside projects where they have a ProjectMember row. Member can create and update issues, comment, and upload in those projects. Manager adds and removes members and manages tags. Only Admin creates, deactivates, and reactivates users and opens Settings.

R-02 Workflows. Ship the fixed status enum only. Do not build a workflow designer in v1. Treat "manage workflows" as managing work inside that fixed set.

R-03 Archive. Store `archivedAt` on issues and projects. Archive hides records from active views and is reversible. Delete is a separate confirmed action. Keep activity rows for deactivated users. Decide cascade before coding delete, and do not invent a cascade in the meantime.

R-04 Duplicate action. Copy title, description, type, priority, tags, project, and due date into a new issue. Leave assignee empty. Do not copy comments, attachments, activity, or subtasks. Do not create a Duplicates link unless the user adds one.

R-05 Bulk actions. Allow status, assignee, add tag, remove tag, and archive on the explicit selection. Require the same permission as the single-issue action. Leave bulk delete out until GAP-03 is decided.

R-06 Saved filters. Store them per user. The SavedFilter row holds the user, a name, and the filter JSON for project, status, priority, assignee, tags, and due date.

R-07 Kanban. Store one shared fractional rank per issue inside its status, scoped to the project. A drag writes status and rank in one transaction and writes activity for a status change. Reject the write if `updatedAt` does not match.

R-08 Keys. Keep a per-project counter updated in the same transaction as the insert. Never reuse a value. Render at least three digits and allow the decimal width to grow, so the key after ECOM-999 is ECOM-1000.

R-09 Subtasks. Allow one parent level in v1. Show subtasks on All Issues and Kanban because they are issues with their own keys and statuses. The parent completion fraction is a count of children in Done over all children.

R-10 Dependencies. Store one directed row for Blocks. Render Is blocked by by reversing that row. Run a transitive cycle check on the blocks graph inside the insert transaction. Store Relates to and Duplicates as separate rows. Reject a dependency from an issue to itself.

R-11 Project move. Keep project immutable on existing issues in v1, which matches the issue-key prefix rule. Editing project on the detail panel can wait until key migration exists.

R-12 Reminders. Store due dates as dates. Evaluate tomorrow, today, and overdue in one configured organization timezone, UTC until Settings defines it. Deduplicate on user, issue, and reminder type. If the due date changes, a new type-and-date pair may notify again. The worker inserts Notification rows only.

R-13 API. Use the JSON envelope for `/api/v1` routes. Leave Better Auth on its own routes. Paginate lists with `page`, `pageSize`, and `total`. Compare `updatedAt` on PATCH and return a conflict when it mismatches.

R-14 Search indexes. Index issue key, project, status, priority, assignee, due date, and updatedAt. Use a trigram index on title for search. Do not search description in v1.

R-15 Bootstrap. The migrate container creates the first admin from environment variables supplied at first boot, then the operator removes those values from the host environment. The image does not contain a default password.
