"use client";

import { useState, useCallback } from "react";
import { Bold, Italic, List, Heading1, Heading2, Eye, Code, Link2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your announcement...",
  rows = 10,
}: RichTextEditorProps) {
  const [preview, setPreview] = useState(false);

  const insertMarkdown = useCallback(
    (prefix: string, suffix: string = "") => {
      const textarea = document.getElementById("rich-editor") as HTMLTextAreaElement;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const newText = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
      }, 0);
    },
    [value, onChange]
  );

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mb-2 text-purple-neon">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-3 text-purple-neon">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 text-purple-neon">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-200">$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-purple-glow/20 text-purple-neon text-sm font-mono">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300">• $1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-gray-300">$1. $2</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-purple-neon underline hover:text-purple-glow">$1</a>')
      .replace(/\n/g, "<br />");
  };

  const buttons = [
    { icon: Bold, label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertMarkdown("*", "*") },
    { icon: Code, label: "Code", action: () => insertMarkdown("`", "`") },
    { icon: Heading1, label: "Heading 1", action: () => insertMarkdown("# ") },
    { icon: Heading2, label: "Heading 2", action: () => insertMarkdown("## ") },
    { icon: List, label: "List", action: () => insertMarkdown("- ") },
    { icon: Link2, label: "Link", action: () => insertMarkdown("[", "](url)") },
  ];

  return (
    <div className="rounded-lg border border-purple-glow/30 bg-black/30 overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-purple-glow/20 bg-black/20">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className="p-1.5 rounded hover:bg-purple-glow/20 text-gray-400 hover:text-purple-neon transition-all"
            title={btn.label}
          >
            <btn.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
            preview
              ? "bg-purple-glow/20 text-purple-neon border border-purple-glow/40"
              : "text-gray-400 hover:text-purple-neon hover:bg-purple-glow/10"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
      </div>

      {preview ? (
        <div
          className="p-4 min-h-[200px] text-sm text-gray-300 leading-relaxed prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || '<span class="text-gray-600">Nothing to preview...</span>' }}
        />
      ) : (
        <textarea
          id="rich-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 bg-transparent text-sm text-white outline-none resize-none placeholder-gray-600 font-mono"
          required
        />
      )}

      <div className="px-3 py-1.5 border-t border-purple-glow/10 flex items-center gap-3 text-[10px] text-gray-600">
        <span>**bold**</span>
        <span>*italic*</span>
        <span>`code`</span>
        <span># heading</span>
        <span>- list</span>
        <span>[link](url)</span>
      </div>
    </div>
  );
}
