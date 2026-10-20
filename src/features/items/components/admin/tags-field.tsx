"use client";

import { useState } from "react";
import { ITEM_LIMITS } from "../../domain/limits";
import { Input } from "@/components/ui/input";

type Props = { tags: string[]; onChange: (tags: string[]) => void };

export function TagsField({ tags, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const tag = draft.trim().toLowerCase().slice(0, ITEM_LIMITS.tagMax);
    if (tag && !tags.includes(tag) && tags.length < ITEM_LIMITS.tagsMax) onChange([...tags, tag]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <Input
        value={draft}
        aria-label="Nova tag"
        placeholder="Digite e pressione Enter (ex.: bike, aro 29)"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
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
