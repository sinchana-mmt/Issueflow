---
docId: "issueflow.prd.v1.export-backup"
title: "CSV and JSON export, backups, and restore"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.15"
  - "8.1"
  - "10"
  - "14"
kind: "requirement"
authority: "normative"
embed: true
priority: "P1"
status: "specified"
entities:
  - "Issue"
  - "Attachment"
keywords:
  - "export"
  - "CSV"
  - "JSON"
  - "backup"
  - "restore"
questions:
  - "What can users export, and in which formats?"
  - "What must a backup include?"
  - "How many backup sets are kept?"
  - "When is restore tested?"
---

Users with appropriate permissions can export all permitted issues, filtered issues, project issues, and individual issue data. Formats are CSV and JSON. Exports respect project permissions and the applied filters. Endpoints are `/exports/issues.csv` and `/exports/issues.json` under `/api/v1`. Export and backup/restore are roadmap phase 11, priority P1. The acceptance scenario requires export of permitted issue data.

Backup requirements: a PostgreSQL database backup; an attachment directory backup; a daily automated backup capability; seven daily backup sets by default; backups may be stored outside Docker volumes; restoration steps are documented; restoration is tested before the product is declared production-ready.

A database backup without its corresponding attachments is not a complete backup. The definition of done requires backup and restore procedures to be documented and tested. The PRD does not choose the dump tool, the schedule clock, or whether restore returns pg-boss jobs.
