"use client";

import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TurndownService from "turndown";
import { useState } from "react";
import { Button } from "@/components/ui";

const turndown = new TurndownService();
turndown.addRule("taskItem", {
  filter: (node) => node.nodeName === "LI" && (node as HTMLElement).getAttribute("data-type") === "taskItem",
  replacement: (content, node) => {
    const checked = (node as HTMLElement).getAttribute("data-checked") === "true";
    return `- [${checked ? "x" : " "}] ${content.trim()}\n`;
  },
});

export function MarkdownEditor({ html, onSave }: { html: string; onSave: (markdown: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write with Markdown formatting" }),
      TaskList,
      TaskItem.configure({ nested: false }),
    ],
    content: html || "<p></p>",
    editorProps: { attributes: { class: "prose-editor text-sm" } },
  });

  if (!editing) {
    return (
      <div>
        <div className="markdown text-sm" dangerouslySetInnerHTML={{ __html: html || "<p class='text-faint'>No description yet.</p>" }} />
        <Button className="mt-3" variant="ghost" onClick={() => { editor?.commands.setContent(html || "<p></p>"); setEditing(true); }}>Edit description</Button>
      </div>
    );
  }

  return (
    <div className="rounded-[12px] border border-line bg-canvas p-3">
      <div className="mb-2 flex flex-wrap gap-1">
        <ToolbarButton label="B" onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolbarButton label="I" onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <ToolbarButton label="S" onClick={() => editor?.chain().focus().toggleStrike().run()} />
        <ToolbarButton label="H2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton label="List" onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolbarButton label="1." onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton label="Check" onClick={() => editor?.chain().focus().toggleTaskList().run()} />
        <ToolbarButton label="Code" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} />
        <ToolbarButton label="Quote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton
          label="Link"
          onClick={() => {
            const href = window.prompt("Link URL");
            if (href) editor?.chain().focus().setLink({ href }).run();
          }}
        />
      </div>
      <EditorContent editor={editor} />
      <div className="mt-3 flex gap-2">
        <Button
          onClick={async () => {
            await onSave(turndown.turndown(editor?.getHTML() || ""));
            setEditing(false);
          }}
        >
          Save description
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function ToolbarButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-ink" onClick={onClick}>{label}</button>;
}
