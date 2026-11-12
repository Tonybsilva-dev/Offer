export const addItemContactCategory = {
  id: "003-add-item-contact-category",
  statements: [
    "ALTER TABLE items ADD COLUMN whatsapp_number TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE items ADD COLUMN category TEXT NOT NULL DEFAULT 'outros'",
    "ALTER TABLE items ADD CONSTRAINT items_category_check CHECK (category IN ('eletronicos', 'informatica', 'celulares', 'eletrodomesticos', 'moveis', 'casa-decoracao', 'roupas-acessorios', 'esportes-lazer', 'livros-papelaria', 'brinquedos-jogos', 'ferramentas', 'outros'))",
  ],
};
