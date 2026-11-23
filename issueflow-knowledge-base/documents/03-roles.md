---
docId: "issueflow.prd.v1.roles"
title: "Application roles and the permissions the PRD states"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "2"
  - "2.1"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Admin"
  - "Manager"
  - "Member"
  - "ProjectMember"
keywords:
  - "RBAC"
  - "roles"
  - "permissions"
  - "project membership"
questions:
  - "What roles does IssueFlow have?"
  - "What can an Admin, Manager, and Member do?"
  - "Does a Member create projects?"
  - "Where is project membership separate from application role?"
---

IssueFlow has three application roles.

Admin has full application access, user management, project management, and settings.

Manager can create projects, manage issues, assign members, and manage tags and workflows.

Member can view permitted projects, create and update permitted issues, comment, and upload attachments.

"Permitted" is project scope. Project membership is a separate relationship from the application role. The PRD requires role-based access control on every protected operation, plus project-level authorization. Every issue, project, attachment, comment, and notification access is checked against the authenticated user's permissions.

The role table does not give Member permission to create projects, manage users, assign project members, or manage tags. Admin is the role that manages users and settings. Manager is the role that creates projects and assigns members.

The phrase "manage workflows" appears in the Manager role. Version 1 also lists complex workflow automation as a non-goal, and it defines one fixed status set. The PRD does not describe a workflow designer.

Bulk actions apply only to issues the user explicitly selects and is authorized to modify. Exports must respect project permissions. The PRD says export requires appropriate permissions and does not name the role. Deleting an issue requires confirmation; the PRD does not name which role may delete.
