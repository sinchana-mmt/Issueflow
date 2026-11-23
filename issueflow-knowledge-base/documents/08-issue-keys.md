---
docId: "issueflow.prd.v1.issue-keys"
title: "Issue key format and concurrent unique numbering"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.3"
  - "7.1"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "Project"
keywords:
  - "issue key"
  - "ECOM-001"
  - "sequence"
  - "transaction"
questions:
  - "What does an issue key look like?"
  - "How are issue numbers generated when two users create issues at once?"
  - "Are issue keys unique?"
---

An issue key combines the project key with a generated number. Examples in the PRD are ECOM-001, ECOM-002, ECOM-003, WEB-001, and WEB-002. The number is per project. Issue keys must be unique.

Issue numbers are generated inside a database transaction and stay unique when multiple users create issues at the same time. Issue IDs use the same transactional rule. Database rule 1 says issue IDs are generated safely inside transactions. Database rule 2 says issue keys are unique.

The examples use three digits. The PRD does not state the width after 999, whether numbers may be skipped, or whether a rolled-back create may reuse a number. Changing a project key after issues exist requires a safe migration; otherwise the project key is immutable, which also freezes the prefix of existing issue keys.
