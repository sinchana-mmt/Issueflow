---
docId: "issueflow.prd.v1.dependencies"
title: "Issue dependency types and blocking rules"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.8"
  - "7.1"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Dependency"
  - "Issue"
keywords:
  - "blocks"
  - "relates to"
  - "duplicates"
  - "circular dependency"
questions:
  - "What issue relationship types exist?"
  - "Are Blocks and Is blocked by stored separately?"
  - "What dependency links are rejected?"
  - "Does a blocking link change status to Blocked?"
---

Users manually link related issues. Supported relationship types are Blocks, Is blocked by, Relates to, and Duplicates. The PRD says Is blocked by is the inverse representation of Blocks.

Requirements: search for existing issues; select a related issue and a relationship type; view linked issues in issue details; remove dependencies; prevent self-dependencies; prevent circular blocking relationships.

The system must not automatically change issue status because of dependencies. A Blocks link does not set status to Blocked. Blocked remains a status a person selects.

Database rule 4: circular blocking dependencies must be rejected. The PRD does not say whether cycle detection is only direct (A blocks B and B blocks A) or transitive (A blocks B blocks C blocks A). It does not say whether Relates to or Duplicates are symmetric, and it does not apply the circularity rule to those types.

The API group is `/issues/:id/dependencies`. The Dependency entity stores issue relationships. Project and issue relationships must be validated.
