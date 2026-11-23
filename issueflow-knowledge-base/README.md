# IssueFlow knowledge base

Source specification: IssueFlow PRD v1.0 (`source/IssueFlow_PRD.md`).
Corpus version: `issueflow-prd-1.0.0`.
Built: 2026-11-23.

This folder is the retrieval corpus for a later RAG system. It is also the document set a future Digitrac ingest job can load. It is product knowledge about IssueFlow. It is not live issue data, and it is not Digitrac invoice, stock, or IQC data.

## What to embed

Embed every record in `dist/issueflow-prd.jsonl` whose field `embed` is `true`.

Each record is already one retrieval unit. Do not split these records further. The `text` field is self-contained. The `questions` field lists the questions that record should answer.

Build the embedding input as:

```text
{title}

Questions this record answers:
{questions joined by newlines}

{text}
```

Store `docId`, `kind`, `authority`, `prdSections`, `entities`, and `keywords` as filterable metadata. Return `docId` and `prdSections` as the citation.

## Authority

| `kind` | `authority` | How an answer may use it |
|---|---|---|
| `requirement` | `normative` | State it as specified behavior |
| `gap` | `unspecified` | Say the PRD does not decide this. Do not fill it in |
| `recommendation` | `advisory` | Present it as an implementation proposal, separate from the spec |
| `integration` | `advisory` | Use it for a later Digitrac RAG hookup, not as IssueFlow v1 scope |

`source/IssueFlow_PRD.md` is the canonical prose. It is kept for provenance and is not included in the JSONL, so retrieval cannot return the whole PRD beside a chunk.

## Digitrac boundary

Digitrac (`digitrail-onpremise`) is the on-prem inward, invoice, stock, and IQC system. Its current AI path is `POST /generate-report`: a natural-language query over that tenant's MongoDB, with token use logged on `llmtransactions`. That path has no vector index.

Keep this corpus on a separate retrieval path.

- Collection for documents: `knowledgedocuments`
- Collection for chunks: `knowledgechunks`
- Log token use with `typeOfLLM: "issueflow-kb"`
- Filter `corpus: "issueflow"`
- Do not insert these chunks into `invoicedatas`, `stocks`, or `iqcrecords`

IssueFlow v1 does not include Digitrac, GitHub, Slack, or Jira integrations. A later bridge may copy Digitrac context into an issue only after a person submits that issue. The spec forbids automatic issue creation.

Regenerate the JSONL after any chunk edit:

```bash
node scripts/build-jsonl.mjs
```
