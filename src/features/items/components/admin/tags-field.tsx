"use client";

import { useState } from "react";
import { mergeTags, TAG_SEPARATOR } from "../../domain/tags";
import { Input } from "@/components/ui/input";

type Props = { tags: string[]; onChange: (tags: string[]) => void };

export function TagsField({ tags, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function commit(text: string) {
    const next = mergeTags(tags, text);
    if (next.length !== tags.length) onChange(next);
  }

  function add() {
    commit(draft);
    setDraft("");
  }

  // Texto colado ou vírgula de teclado de celular não passam pelo onKeyDown: o que já tem separador vira tag,
  // e o trecho depois do último separador continua sendo digitado.
  function type(value: string) {
    const parts = value.split(TAG_SEPARATOR);
    if (parts.length === 1) return setDraft(value);
    const rest = parts.pop() ?? "";
    commit(parts.join(","));
    setDraft(rest.trimStart());
  }

  return (
    <div className="space-y-2">
      <Input
        value={draft}
        aria-label="Nova tag"
        placeholder="Separe por vírgula ou Enter (ex.: bike, aro 29)"
        onChange={(e) => type(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (!TAG_SEPARATOR.test(text)) return;
          e.preventDefault();
          commit(draft + text);
          setDraft("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag} className="flex items-center gap-1 border-2 border-foreground bg-card px-2 py-0.5 text-xs font-medium">
            #{tag}
            <button type="button" className="hover:text-destructive" aria-label={`Remover ${tag}`} onClick={() => onChange(tags.filter((t) => t !== tag))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
