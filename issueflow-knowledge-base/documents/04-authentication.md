---
docId: "issueflow.prd.v1.authentication"
title: "Authentication, sessions, and account administration"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "2.1"
  - "6.2"
  - "6.3"
  - "7"
  - "9"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "User"
  - "Account"
  - "Session"
  - "Verification"
  - "BetterAuth"
keywords:
  - "authentication"
  - "password"
  - "session"
  - "Better Auth"
  - "bootstrap admin"
questions:
  - "How do users sign in to IssueFlow?"
  - "Can people register themselves?"
  - "Who creates accounts?"
  - "What happens when a user is deactivated?"
  - "How is the first admin created?"
---

IssueFlow uses email and password authentication, secure password hashing, and session-based authentication. The chosen library is Better Auth. Authentication entities are User, Account, Session, and Verification, and they must follow the Better Auth adapter schema actually in use.

There is no public registration. An admin creates accounts. An admin can deactivate or reactivate users. Inactive users cannot log in. Users can change their own passwords. Deactivated users must not lose historical activity records.

Cookies that carry the session are HTTP-only and use appropriate security settings. Login is rate limited. Credentials must not be hardcoded. A secure initial admin account is created through a documented bootstrap process.

Sign-in, sign-out, and session endpoints are managed by Better Auth. The PRD does not specify password complexity, session lifetime, multi-factor authentication, email verification behavior, or the invite and temporary-password flow. The Verification entity exists because the Better Auth adapter schema includes it.
