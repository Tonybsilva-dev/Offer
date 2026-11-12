"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ITEM_CATEGORIES, ITEM_CONDITIONS, ITEM_STATUSES, type Item } from "../../domain/item";
import { ITEM_LIMITS } from "../../domain/limits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, Field, Fieldset, Select } from "./form-fields";
import { ImagesField } from "./images-field";
import { KeyValueList } from "./key-value-list";
import { TagsField } from "./tags-field";
import { useItemForm } from "./use-item-form";

export function ItemForm({ item }: { item?: Item }) {
  const { state, set, submit, errors, saving } = useItemForm(item);
  const errorSummary = useRef<HTMLUListElement>(null);

  // Após uma tentativa falha, leva o foco ao resumo para teclado e leitores de tela.
  useEffect(() => {
    if (errors.length) errorSummary.current?.focus();
  }, [errors]);

  return (
    <form onSubmit={submit} className="space-y-6">
      {errors.length > 0 && (
        <ul ref={errorSummary} tabIndex={-1} role="alert" className="space-y-1 border-2 border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive outline-none focus-visible:ring-3 focus-visible:ring-destructive/40">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <Fieldset legend="Fotos">
        <ImagesField
          photos={[state.mainImage, ...state.images].filter(Boolean)}
          onChange={([mainImage = "", ...images]) => {
            set("mainImage", mainImage);
            set("images", images);
          }}
        />
      </Fieldset>

      <Fieldset legend="Identificação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título curto *" hint="Aparece na vitrine. Ex.: Bicicleta">
            <Input value={state.title} maxLength={ITEM_LIMITS.titleMax} required onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Marca *">
            <Input value={state.brand} required onChange={(e) => set("brand", e.target.value)} />
          </Field>
        </div>
        <Field label="Nome completo" hint="Aparece na página do item. Ex.: Bicicleta Caloi Elite Aro 29">
          <Input value={state.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Categoria">
            <Select value={state.category} options={ITEM_CATEGORIES} onChange={(v) => set("category", v)} />
          </Field>
          <Field label="Estado">
            <Select value={state.condition} options={ITEM_CONDITIONS} onChange={(v) => set("condition", v)} />
          </Field>
          <Field label="Situação">
            <Select value={state.status} options={ITEM_STATUSES} onChange={(v) => set("status", v)} />
          </Field>
        </div>
        <div className="space-y-1">
          <Checkbox label="Ocultar da vitrine" checked={state.hidden} onChange={(v) => set("hidden", v)} />
          <p className="text-xs text-muted-foreground">
            O item deixa de aparecer na vitrine, no sitemap e no link direto (que passa a mostrar “não encontrado”). Continua aqui no painel.
          </p>
        </div>
      </Fieldset>

      <Fieldset legend="Venda">
        <Field label="WhatsApp específico" hint="Opcional. Inclua código do país e DDD, ex.: +55 (85) 99999-9999. Em branco, usa o contato padrão do site.">
          <Input type="tel" maxLength={40} value={state.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} />
        </Field>
        <Checkbox
          label="Lote de itens diversos (cada item tem seu preço)"
          checked={state.isLot}
          onChange={(v) => set("isLot", v)}
        />
        <Field
          label={state.isLot ? "Valor do lote (R$)" : "Valor de venda (R$) *"}
          hint={
            state.isLot
              ? "Deixe em branco ou 0 para exibir “Itens diversos” e liste o valor de cada item nas especificações."
              : "Ex.: 1.250,00"
          }
        >
          <Input value={state.price} inputMode="decimal" required={!state.isLot} onChange={(e) => set("price", e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-6">
          <Checkbox label="Este já é o menor valor" checked={state.isLowestPrice} onChange={(v) => set("isLowestPrice", v)} />
          <Checkbox label="Aceita troca" checked={state.acceptsTrade} onChange={(v) => set("acceptsTrade", v)} />
        </div>
      </Fieldset>

      <Fieldset legend="Descrição e tags">
        <Field label="Descrição">
          <Textarea value={state.description} rows={5} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <TagsField tags={state.tags} onChange={(tags) => set("tags", tags)} />
      </Fieldset>

      <Fieldset legend="Especificações (chave e valor)">
        <KeyValueList
          rows={state.specs}
          columns={[{ name: "key", placeholder: "Chave (ex.: Aro)" }, { name: "value", placeholder: "Valor (ex.: 29)" }]}
          empty={{ key: "", value: "" }}
          addLabel="Adicionar especificação"
          max={ITEM_LIMITS.specsMax}
          onChange={(specs) => set("specs", specs)}
        />
      </Fieldset>

      <Fieldset legend="Informações extras (acordeão)">
        <KeyValueList
          rows={state.details}
          columns={[
            { name: "title", placeholder: "Título (ex.: Retirada)" },
            { name: "content", placeholder: "Conteúdo", multiline: true },
          ]}
          empty={{ title: "", content: "" }}
          addLabel="Adicionar seção"
          max={ITEM_LIMITS.detailsMax}
          onChange={(details) => set("details", details)}
        />
      </Fieldset>

      <div className="sticky bottom-0 z-10 flex gap-3 border-t-2 border-foreground bg-background/90 py-3 backdrop-blur sm:justify-end">
        <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/admin" />}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" variant="accent" className="flex-1 sm:flex-none" disabled={saving}>
          {saving ? "Salvando..." : item ? "Salvar alterações" : "Cadastrar item"}
        </Button>
      </div>
    </form>
  );
}
