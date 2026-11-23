---
docId: "issueflow.prd.v1.markdown"
title: "Markdown in descriptions and comments, and sanitization"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "4.10"
  - "6.2"
  - "9"
kind: "requirement"
authority: "normative"
embed: true
priority: "P0"
status: "specified"
entities:
  - "Issue"
  - "Comment"
keywords:
  - "markdown"
  - "TipTap"
  - "sanitization"
  - "XSS"
questions:
  - "Which Markdown features are supported?"
  - "Why must Markdown be sanitized?"
  - "Which editor is specified?"
---

Descriptions and comments support headings, bold and italic, strikethrough, bulleted and numbered lists, checklists, links, inline code, code blocks, and blockquotes.

Markdown is sanitized before rendering so script injection and unsafe HTML cannot run. This is a security requirement, together with Zod input validation.

The Markdown editor is TipTap. Roadmap phase 7 is comments, activity, and Markdown, priority P0.

The PRD does not say whether checklist checkboxes are interactive. If a person toggles a checkbox inside the description, that is an edit of issue data and must be a user-initiated save. The spec does not define a separate checklist entity.
