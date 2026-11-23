---
docId: "issueflow.prd.v1.rag-policy"
title: "Answer policy for a RAG system using this corpus"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "1"
  - "3.1"
kind: "integration"
authority: "advisory"
embed: true
priority: "P0"
status: "proposed"
entities:
  - "IssueFlow"
keywords:
  - "RAG"
  - "citation"
  - "grounding"
  - "answer policy"
questions:
  - "How should a RAG answer behave when using the IssueFlow knowledge base?"
  - "What should the model do when the PRD does not specify something?"
  - "Which metadata filters should a retrieval query set?"
---

Use this policy when answering from the IssueFlow corpus.

Retrieve with metadata filters before vector similarity. For a product-behavior question, filter `corpus` = `issueflow` and `embed` = true. Prefer `kind` = `requirement` when the user asks what the product does. Include `kind` = `gap` when the user asks whether something is specified. Include `kind` = `recommendation` only when the user asks for a proposed default or an implementation choice. Include `kind` = `integration` when the user asks about Digitrac or RAG.

Answer only from retrieved records. Cite `docId` and `prdSections`. If records conflict, prefer `authority` = `normative` over `advisory` and `unspecified`.

If the retrieved gap record covers the question, say the PRD does not specify that behavior and name the gap id. Do not promote a recommendation into a requirement.

Do not describe automatic status changes, automatic assignment, automatic issue creation, email notifications, sprint metrics, time tracking, or GitHub, GitLab, Slack, or Jira sync as IssueFlow v1 features. Those are non-goals in `issueflow.prd.v1.boundaries`.

Embedding input for each record is the title, then the questions, then the text. Each record is one chunk. Do not merge chunks in the index. At answer time, pass the smallest set of chunks that covers the question so the manual-first rules stay in context for any behavior question.

The raw PRD file `source/IssueFlow_PRD.md` is provenance. It is not an embeddable chunk. Point a human at a PRD section from `prdSections` when they want the original wording.
