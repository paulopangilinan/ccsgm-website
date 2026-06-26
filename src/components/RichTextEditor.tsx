"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Quote, Heading2, LinkIcon, Undo, Redo } from "lucide-react";

/**
 * A Sanity-Studio-like rich text editor for the public "Share Your Story"
 * form — visitors may be writing something close to a full article, not
 * just a one-line message, so plain `<textarea>` formatting isn't enough.
 * The toolbar intentionally only covers what proseMirrorToPortableText.ts
 * knows how to convert: paragraphs, an H2 heading, bold/italic, links,
 * bullet/numbered lists, and blockquotes.
 */
export default function RichTextEditor({
  onChange,
  placeholder,
}: {
  onChange: (json: object, plainText: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Write here…" }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-2.5",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getText());
    },
  });

  if (!editor) {
    return (
      <div className="rounded-xl border border-gray-200 min-h-[240px] flex items-center justify-center text-sm text-gray-400">
        Loading editor…
      </div>
    );
  }

  function toolbarButtonClass(active: boolean) {
    return `p-1.5 rounded-md transition-colors ${active ? "bg-[#1a4731] text-white" : "text-gray-500 hover:bg-gray-100"}`;
  }

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#52b788] focus-within:ring-1 focus-within:ring-[#52b788]">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarButtonClass(editor.isActive("bold"))} aria-label="Bold">
          <Bold size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarButtonClass(editor.isActive("italic"))} aria-label="Italic">
          <Italic size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarButtonClass(editor.isActive("heading", { level: 2 }))} aria-label="Heading">
          <Heading2 size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarButtonClass(editor.isActive("bulletList"))} aria-label="Bullet list">
          <List size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarButtonClass(editor.isActive("orderedList"))} aria-label="Numbered list">
          <ListOrdered size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toolbarButtonClass(editor.isActive("blockquote"))} aria-label="Quote">
          <Quote size={15} />
        </button>
        <button type="button" onClick={setLink} className={toolbarButtonClass(editor.isActive("link"))} aria-label="Link">
          <LinkIcon size={15} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={toolbarButtonClass(false)} aria-label="Undo">
          <Undo size={15} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={toolbarButtonClass(false)} aria-label="Redo">
          <Redo size={15} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
