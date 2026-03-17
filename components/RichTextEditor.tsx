"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useCallback, useState } from "react";

interface RichTextEditorProps {
  initialContent: string;
  titel: string;
  onSave: (titel: string, html: string) => Promise<void>;
  onCancel: () => void;
}

function ToolbarSep() {
  return <span className="w-px bg-gray-300 mx-0.5 self-stretch" />;
}

function ToolbarBtn({
  active = false,
  disabled = false,
  onClick,
  title,
  children,
  className = "",
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 text-sm rounded transition-colors ${
        active
          ? "bg-[#1a6ca8] text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

function ColorPicker({
  editor,
  type,
}: {
  editor: ReturnType<typeof useEditor>;
  type: "color" | "highlight";
}) {
  const colors = [
    { label: "Zwart", value: "#000000" },
    { label: "Blauw", value: "#1a6ca8" },
    { label: "Oranje", value: "#e35b10" },
    { label: "Rood", value: "#dc2626" },
    { label: "Groen", value: "#16a34a" },
    { label: "Grijs", value: "#6b7280" },
  ];
  const highlightColors = [
    { label: "Geel", value: "#fef08a" },
    { label: "Groen", value: "#bbf7d0" },
    { label: "Blauw", value: "#bfdbfe" },
    { label: "Oranje", value: "#fed7aa" },
    { label: "Roze", value: "#fecdd3" },
  ];

  const items = type === "color" ? colors : highlightColors;

  return (
    <div className="relative group/color inline-block">
      <button
        type="button"
        className="px-2 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
        title={type === "color" ? "Tekstkleur" : "Markeerkleur"}
      >
        {type === "color" ? (
          <span>
            A<span style={{ color: "#e35b10" }}>&#9660;</span>
          </span>
        ) : (
          <span style={{ background: "#fef08a", padding: "0 3px" }}>
            ab<span>&#9660;</span>
          </span>
        )}
      </button>
      <div className="absolute left-0 top-full hidden group-hover/color:flex bg-white shadow-lg rounded border border-gray-200 p-1 gap-1 z-50">
        {items.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => {
              if (!editor) return;
              if (type === "color") {
                editor.chain().focus().setColor(c.value).run();
              } else {
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: c.value })
                  .run();
              }
            }}
            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: c.value }}
          />
        ))}
        {type === "color" && (
          <button
            type="button"
            title="Kleur verwijderen"
            onClick={() => editor?.chain().focus().unsetColor().run()}
            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform text-xs bg-white"
          >
            &#10005;
          </button>
        )}
        {type === "highlight" && (
          <button
            type="button"
            title="Markering verwijderen"
            onClick={() => editor?.chain().focus().unsetHighlight().run()}
            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform text-xs bg-white"
          >
            &#10005;
          </button>
        )}
      </div>
    </div>
  );
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL invoeren:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Afbeelding URL invoeren:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="border-b border-gray-200 bg-gray-50 rounded-t">
      {/* Rij 1: Opmaak */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100">
        {/* Tekststijl dropdown */}
        <select
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                    ? "h4"
                    : "p"
          }
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") {
              editor.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(val.replace("h", "")) as 1 | 2 | 3 | 4;
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          className="px-2 py-1 text-sm rounded border border-gray-300 bg-white mr-1"
          title="Opmaak"
        >
          <option value="p">Normaal</option>
          <option value="h1">Kop 1</option>
          <option value="h2">Kop 2</option>
          <option value="h3">Kop 3</option>
          <option value="h4">Kop 4</option>
        </select>

        <ToolbarSep />

        {/* Tekststijlen */}
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Vet (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Cursief (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Onderstrepen (Ctrl+U)"
        >
          <span className="underline">U</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Doorhalen"
        >
          <span className="line-through">S</span>
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Code"
        >
          <code className="text-xs">&lt;/&gt;</code>
        </ToolbarBtn>

        <ToolbarSep />

        {/* Kleuren */}
        <ColorPicker editor={editor} type="color" />
        <ColorPicker editor={editor} type="highlight" />

        <ToolbarSep />

        {/* Undo/Redo */}
        <ToolbarBtn
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          title="Ongedaan maken (Ctrl+Z)"
        >
          ↩
        </ToolbarBtn>
        <ToolbarBtn
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          title="Opnieuw (Ctrl+Y)"
        >
          ↪
        </ToolbarBtn>
      </div>

      {/* Rij 2: Blokken & Media */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        {/* Lijsten */}
        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Opsomming"
        >
          &#8226; Lijst
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Genummerde lijst"
        >
          1. Lijst
        </ToolbarBtn>

        <ToolbarSep />

        {/* Uitlijning */}
        <ToolbarBtn
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Links uitlijnen"
        >
          &#9776;
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Centreren"
        >
          &#9776;
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Rechts uitlijnen"
        >
          &#9776;
        </ToolbarBtn>

        <ToolbarSep />

        {/* Blokken */}
        <ToolbarBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citaat"
        >
          &ldquo; Citaat
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Codeblok"
        >
          {"{}"} Code
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontale lijn"
        >
          &#8213; Lijn
        </ToolbarBtn>

        <ToolbarSep />

        {/* Link & Media */}
        <ToolbarBtn
          active={editor.isActive("link")}
          onClick={setLink}
          title="Link invoegen/bewerken"
        >
          &#128279; Link
        </ToolbarBtn>
        {editor.isActive("link") && (
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Link verwijderen"
            className="bg-red-100 text-red-700 hover:bg-red-200"
          >
            Unlink
          </ToolbarBtn>
        )}
        <ToolbarBtn onClick={addImage} title="Afbeelding invoegen (URL)">
          &#128247; Afbeelding
        </ToolbarBtn>

        <ToolbarSep />

        {/* Tabel */}
        <ToolbarBtn
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Tabel invoegen (3x3)"
        >
          &#9638; Tabel
        </ToolbarBtn>
        {editor.isActive("table") && (
          <>
            <ToolbarBtn
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Kolom toevoegen"
            >
              +Kolom
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Rij toevoegen"
            >
              +Rij
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Kolom verwijderen"
              className="bg-red-50 text-red-700 hover:bg-red-100"
            >
              -Kolom
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Rij verwijderen"
              className="bg-red-50 text-red-700 hover:bg-red-100"
            >
              -Rij
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Tabel verwijderen"
              className="bg-red-50 text-red-700 hover:bg-red-100"
            >
              &#10005; Tabel
            </ToolbarBtn>
          </>
        )}
      </div>
    </div>
  );
}

export default function RichTextEditor({
  initialContent,
  titel: initialTitel,
  onSave,
  onCancel,
}: RichTextEditorProps) {
  const [titel, setTitel] = useState(initialTitel);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#1a6ca8] hover:underline",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-3 py-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      HorizontalRule,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "cms-content prose max-w-none p-4 min-h-[400px] focus:outline-none",
      },
    },
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      await onSave(titel, editor.getHTML());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Titel */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titel
        </label>
        <input
          type="text"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-xl font-light text-[#1a6ca8] focus:outline-none focus:ring-2 focus:ring-[#1a6ca8]"
        />
      </div>

      {/* Tekstopmaak label */}
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">
          Inhoud
        </label>
        <span className="text-xs text-gray-400">Tekstopmaak: Rich HTML</span>
      </div>

      {/* Editor */}
      <div className="border border-gray-300 rounded overflow-hidden">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {/* Actieknoppen */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#e35b10] text-white rounded hover:bg-[#c94d0c] disabled:opacity-50 font-medium"
        >
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}
