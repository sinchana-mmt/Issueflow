---
docId: "issueflow.prd.v1.security"
title: "Security controls required even for local installs"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "9"
  - "2.1"
  - "4.10"
  - "4.11"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "User"
  - "Session"
  - "Attachment"
keywords:
  - "security"
  - "RBAC"
  - "rate limit"
  - "sanitization"
  - "audit"
questions:
  - "What security controls does IssueFlow require?"
  - "Are local installs exempt from authorization?"
  - "Who can download an attachment?"
  - "Which admin actions are audited?"
---

Security applies to local self-hosted installations. A local deployment does not drop these controls.

Required controls: secure password hashing; HTTP-only authentication cookies with appropriate security settings; role-based access control; project-level authorization; Zod input validation; file upload validation; Markdown sanitization before render; protection against SQL injection; login rate limiting; secure secret management; audit logging for important administrative actions; no public attachment URLs; no hardcoded credentials; no database port exposure by default.

Every issue, project, attachment, comment, and notification access is checked against the authenticated user's permissions. Prisma is the ORM, which is the specified way queries are constructed. Attachment endpoints are authenticated and authorized. MIME type, extension, and file size are validated. The default size cap is 20 MB.

The PRD requires audit logging for important administrative actions and does not list those actions. It requires login rate limiting and does not state a general API rate limit. It requires HTTPS when the application is exposed to the public internet.
