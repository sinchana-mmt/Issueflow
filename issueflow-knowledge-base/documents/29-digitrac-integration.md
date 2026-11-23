---
docId: "issueflow.prd.v1.digitrac-integration"
title: "Later Digitrac knowledge-base integration contract"
corpus: "issueflow"
source: "IssueFlow_PRD.md"
sourceVersion: "1.0"
prdSections:
  - "1.2"
  - "3.1"
kind: "integration"
authority: "advisory"
embed: true
priority: "P1"
status: "proposed"
entities:
  - "Digitrac"
  - "IssueFlow"
  - "Notification"
keywords:
  - "Digitrac"
  - "digitrail"
  - "RAG"
  - "knowledgechunks"
  - "llmtransactions"
questions:
  - "How should IssueFlow knowledge integrate with Digitrac later?"
  - "Can Digitrac AI reports answer IssueFlow questions?"
  - "May Digitrac automatically create an IssueFlow issue?"
  - "Which Mongo collections store this knowledge base?"
---

This record describes a later integration. It is not IssueFlow v1 scope. IssueFlow v1 non-goals exclude external integrations, automatic issue creation, and AI-generated issues.

Digitrac, in the repository `digitrail-onpremise`, is a separate on-prem product. It tracks inward documents, invoices, stock, and IQC in MongoDB. Relevant existing collections include `invoicedatas`, `invoicetranscations`, `stocks`, `iqcrecords`, and `llmtransactions`. Its current AI feature posts a query to FastAPI `/generate-report` with the tenant MongoDB URI and asks questions about that tenant's operational data. Token use is inserted into `llmtransactions` with a `typeOfLLM` string. That path is not a document knowledge base. It has no chunk store and no vector index.

Use this corpus for a second path that answers questions about the IssueFlow specification.

Proposed Digitrac collections, new and separate from invoices:

- `knowledgedocuments`: one row per source record, with `docId`, `corpus` = `issueflow`, `corpusVersion` = `issueflow-prd-1.0.0`, `kind`, `authority`, `title`, `prdSections`, `sourceFile`, and timestamps.
- `knowledgechunks`: the embeddable text, the embedding vector, `docId`, and the same filter fields. Load rows from `dist/issueflow-prd.jsonl` where `embed` is true.

Query rules:

- Retrieve only `corpus` = `issueflow` for IssueFlow questions.
- Do not send these chunks to `/generate-report` and do not query `invoicedatas` in the same retrieval.
- Log tokens with `typeOfLLM` = `issueflow-kb` so usage stays distinct from `aireports`.
- Cite `docId` and `prdSections` in the answer.
- When the best chunk has `authority` = `unspecified`, say the PRD does not decide it.
- When the best chunk has `authority` = `advisory`, call it a proposal.

Access: this corpus is product documentation for people building or operating IssueFlow. It is not plant invoice data. Gate it with a Digitrac permission for that audience. Do not inherit invoice ACLs, and do not expose it through the inward CSV folders.

A later product bridge from a Digitrac IQC or invoice screen to IssueFlow may prefill a draft. A person still submits the issue. Digitrac must not call IssueFlow to create, assign, or close an issue by itself. That would break the manual-first rule and the ban on automatic issue creation.

Live IssueFlow issues, if indexed later, are a different corpus, `issueflow-runtime`, filtered by that user's project permissions. Do not mix runtime issues into `issueflow-prd-1.0.0`.
