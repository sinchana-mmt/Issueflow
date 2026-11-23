import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.use({ gfm: true, breaks: true });

export function renderMarkdown(source: string) {
  const rendered = marked.parse(source || "", { async: false });
  const html = typeof rendered === "string" ? rendered : "";
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "del", "s", "input", "h1", "h2"],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      input: ["type", "checked", "disabled"],
      code: ["class"],
      li: ["data-checked"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
