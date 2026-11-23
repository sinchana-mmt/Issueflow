import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = path.join(root, "documents");
const distDir = path.join(root, "dist");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error("Missing frontmatter");
  const meta = {};
  let currentList = null;
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentList) {
      meta[currentList].push(JSON.parse(listItem[1]));
      continue;
    }
    const field = line.match(/^([A-Za-z0-9]+):\s*(.*)$/);
    if (!field) throw new Error(`Bad frontmatter line: ${line}`);
    currentList = null;
    const [, key, value] = field;
    if (value === "") {
      meta[key] = [];
      currentList = key;
    } else if (value === "true" || value === "false") {
      meta[key] = value === "true";
    } else {
      meta[key] = JSON.parse(value);
    }
  }
  return { meta, text: match[2].trim() };
}

const files = fs
  .readdirSync(docsDir)
  .filter((name) => name.endsWith(".md"))
  .sort();

const records = files.map((name) => {
  const raw = fs.readFileSync(path.join(docsDir, name), "utf8");
  const { meta, text } = parseFrontmatter(raw);
  if (!meta.docId) throw new Error(`${name} has no docId`);
  return {
    ...meta,
    text,
    sourceFile: `documents/${name}`,
    corpusVersion: "issueflow-prd-1.0.0",
  };
});

const ids = new Set();
for (const record of records) {
  if (ids.has(record.docId)) throw new Error(`Duplicate docId ${record.docId}`);
  ids.add(record.docId);
}

fs.mkdirSync(distDir, { recursive: true });
const jsonl = records.map((record) => JSON.stringify(record)).join("\n") + "\n";
fs.writeFileSync(path.join(distDir, "issueflow-prd.jsonl"), jsonl);
const authorityByKind = {
  requirement: "normative",
  gap: "unspecified",
  recommendation: "advisory",
  integration: "advisory",
};
for (const record of records) {
  if (authorityByKind[record.kind] !== record.authority) {
    throw new Error(`${record.docId} kind ${record.kind} does not match authority ${record.authority}`);
  }
  if (!record.text || record.questions.length === 0 || record.prdSections.length === 0) {
    throw new Error(`${record.docId} is missing text, questions, or sections`);
  }
}

const sample = records.find((record) => record.embed);
fs.writeFileSync(
  path.join(distDir, "digitrac-knowledgechunk.example.json"),
  JSON.stringify(
    {
      docId: sample.docId,
      corpus: sample.corpus,
      corpusVersion: sample.corpusVersion,
      kind: sample.kind,
      authority: sample.authority,
      title: sample.title,
      prdSections: sample.prdSections,
      entities: sample.entities,
      keywords: sample.keywords,
      questions: sample.questions,
      text: sample.text,
      sourceFile: sample.sourceFile,
      typeOfLLM: "issueflow-kb",
      embedding: "<float[] produced at ingest time>",
      createdAt: "2026-11-23T00:00:00.000Z",
      updatedAt: "2026-11-23T00:00:00.000Z",
    },
    null,
    2,
  ) + "\n",
);

fs.writeFileSync(
  path.join(distDir, "manifest.json"),
  JSON.stringify(
    {
      corpus: "issueflow",
      corpusVersion: "issueflow-prd-1.0.0",
      source: "IssueFlow PRD v1.0",
      embedField: "text",
      embedPrefix: "title + questions + text",
      recordCount: records.length,
      embedCount: records.filter((record) => record.embed).length,
      records: records.map(({ text, ...meta }) => meta),
    },
    null,
    2,
  ) + "\n",
);

console.log(`Wrote ${records.length} records (${records.filter((r) => r.embed).length} embeddable)`);
