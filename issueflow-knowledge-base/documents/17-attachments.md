---
docId: "issueflow.prd.v1.attachments"
title: "Attachment types, limits, storage, and authorized download"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.11"
  - "6.1"
  - "6.3"
  - "7.1"
  - "9"
  - "11"
kind: "requirement"
authority: "normative"
embed: true
priority: "P1"
status: "specified"
entities:
  - "Attachment"
  - "Issue"
keywords:
  - "attachments"
  - "20 MB"
  - "upload"
  - "persistent volume"
questions:
  - "Which file types can be uploaded?"
  - "What is the maximum attachment size?"
  - "Where are files stored?"
  - "Can attachment URLs be public?"
---

Users can upload files to issues. Attachments are roadmap phase 9, priority P1. The acceptance scenario and the definition of done both require secure attachments before the MVP is complete.

Initial supported formats are PNG, JPG and JPEG, WEBP, PDF, TXT, CSV, DOCX, XLSX, and ZIP. The default maximum file size is 20 MB.

The product shows file name, size, and uploader. Users can download attachments and delete them after a permission check. Files are stored on a persistent Docker volume named `attachments`. Attachment metadata is stored in PostgreSQL on the Attachment entity. Files are served through authenticated, authorized endpoints. The server validates MIME type, extension, and file size.

Attachments must survive container restarts and application upgrades. There are no public attachment URLs. A database backup without the matching attachment files is not a complete backup. Database rule 8: files live outside the database, metadata lives in PostgreSQL. Database rule 9: database and attachment backups are coordinated.

The PRD does not specify the on-disk path layout, virus scanning, ZIP content inspection, or what happens to the file if the database transaction fails.
