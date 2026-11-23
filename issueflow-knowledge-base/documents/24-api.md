---
docId: "issueflow.prd.v1.api"
title: "REST API envelope, prefix, and endpoint groups"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "8"
  - "8.1"
  - "11"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "Project"
  - "User"
keywords:
  - "API"
  - "/api/v1"
  - "Zod"
  - "error envelope"
questions:
  - "What is the IssueFlow API prefix and response shape?"
  - "Which endpoint groups exist?"
  - "What must every endpoint do before business logic?"
  - "What is the typical API latency target?"
---

All application APIs use the prefix `/api/v1`.

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

The example error code is `VALIDATION_ERROR`. The PRD does not publish a full error-code catalog, a pagination shape, or idempotency rules.

Endpoint groups:

| Module | Examples |
|---|---|
| Authentication | Better Auth sign-in, sign-out, and session endpoints |
| Users | `GET/POST /users`, `PATCH /users/:id` |
| Projects | `GET/POST /projects`, `PATCH /projects/:id` |
| Project members | `/projects/:id/members` |
| Issues | `GET/POST /issues`, `GET/PATCH/DELETE /issues/:id` |
| Subtasks | `/issues/:id/subtasks` |
| Tags | `/projects/:id/tags`, `/tags/:id` |
| Comments | `/issues/:id/comments` |
| Attachments | `/issues/:id/attachments` |
| Dependencies | `/issues/:id/dependencies` |
| Activity | `/issues/:id/activity` |
| Notifications | `/notifications` |
| Saved filters | `/filters` |
| Exports | `/exports/issues.csv`, `/exports/issues.json` |

Every endpoint validates input, authenticates the user, checks permissions, and calls the service layer. Business logic stays out of route handlers. Validation uses Zod.

The initial target for a typical API response is under 500 ms, excluding file transfers. Export and attachment download are file transfers. Browser support for the UI is current Chrome, Firefox, Edge, and Safari.

Better Auth manages its own sign-in, sign-out, and session endpoints. The PRD does not say those routes use this JSON envelope.
