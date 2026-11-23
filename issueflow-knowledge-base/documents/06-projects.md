---
docId: "issueflow.prd.v1.projects"
title: "Projects, project keys, members, and tags"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.2"
  - "4.12"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Project"
  - "ProjectMember"
  - "Tag"
keywords:
  - "project"
  - "project key"
  - "archive"
  - "members"
questions:
  - "What fields does a project have?"
  - "Can a project key change after issues exist?"
  - "What project actions exist?"
  - "Are tags global or per project?"
---

Users with the right permissions can create and manage projects. Project screens and project details are P0.

Project fields are: project name (human-readable), project key (unique short identifier such as ECOM), description (optional), members (users on the project), tags (project-specific), status (active or archived), created by, and created at.

Project actions are: create and edit projects, archive projects, view the project overview, add and remove members, view project issues and the board, manage project tags, and view project activity.

Project keys must be unique. Once issues exist, changing a project key requires a safe migration mechanism. Without that mechanism, the key is immutable. The PRD does not specify the migration steps, whether existing issue keys are rewritten, or whether project restore exists after archive.

Tags are created and managed manually. Tags belong to one project. A tag has a custom name and a selectable color. An issue can have multiple tags. Users can search and filter by tag, rename a tag, and delete a tag with appropriate handling of linked issues. The PRD does not define whether delete removes links only or blocks delete while links exist.
