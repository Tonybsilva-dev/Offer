"use client";

import { ITEM_CONDITIONS, ITEM_STATUSES, type Item } from "../../domain/item";
import { ITEM_LIMITS } from "../../domain/limits";
import { Checkbox, Field, Fieldset, inputClass, Select } from "./form-fields";
import { ImagesField } from "./images-field";
import { KeyValueList } from "./key-value-list";
import { TagsField } from "./tags-field";
import { useItemForm } from "./use-item-form";

export function ItemForm({ item }: { item?: Item }) {
  const { state, set, submit, errors, saving } = useItemForm(item);

  return (
    <form onSubmit={submit} className="space-y-6">
      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-xl border border-red-600/40 bg-red-600/10 p-4 text-sm text-red-700">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <Fieldset legend="Fotos">
        <ImagesField
          mainImage={state.mainImage}
          images={state.images}
          onChange={({ mainImage, images }) => {
            set("mainImage", mainImage);
            set("images", images);
          }}
        />
      </Fieldset>

      <Fieldset legend="Identificação">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título curto *" hint="Aparece na vitrine. Ex.: Bicicleta">
            <input value={state.title} maxLength={ITEM_LIMITS.titleMax} required onChange={(e) => set("title", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Marca *">
            <input value={state.brand} required onChange={(e) => set("brand", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Nome completo" hint="Aparece na página do item. Ex.: Bicicleta Caloi Elite Aro 29">
          <input value={state.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Estado">
            <Select value={state.condition} options={ITEM_CONDITIONS} onChange={(v) => set("condition", v)} />
          </Field>
          <Field label="Situação">
            <Select value={state.status} options={ITEM_STATUSES} onChange={(v) => set("status", v)} />
          </Field>
        </div>
      </Fieldset>

      <Fieldset legend="Venda">
        <Field label="Valor de venda (R$) *" hint="Ex.: 1.250,00">
          <input value={state.price} inputMode="decimal" required onChange={(e) => set("price", e.target.value)} className={inputClass} />
        </Field>
        <div className="flex flex-wrap gap-6">
          <Checkbox label="Este já é o menor valor" checked={state.isLowestPrice} onChange={(v) => set("isLowestPrice", v)} />
          <Checkbox label="Aceita troca" checked={state.acceptsTrade} onChange={(v) => set("acceptsTrade", v)} />
        </div>
      </Fieldset>

      <Fieldset legend="Descrição e tags">
        <Field label="Descrição">
          <textarea value={state.description} rows={5} onChange={(e) => set("description", e.target.value)} className={inputClass} />
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

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-background/90 py-3 backdrop-blur">
        <button disabled={saving} className="rounded-lg bg-foreground px-5 py-2 text-background disabled:opacity-60">
          {saving ? "Salvando..." : item ? "Salvar alterações" : "Cadastrar item"}
        </button>
      </div>
    </form>
  );
}
