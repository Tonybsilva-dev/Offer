export const addHealthBeautyCategory = {
  id: "004-add-health-beauty-category",
  statements: [
    "ALTER TABLE items DROP CONSTRAINT items_category_check",
    "ALTER TABLE items ADD CONSTRAINT items_category_check CHECK (category IN ('eletronicos', 'informatica', 'celulares', 'eletrodomesticos', 'moveis', 'casa-decoracao', 'roupas-acessorios', 'esportes-lazer', 'livros-papelaria', 'brinquedos-jogos', 'ferramentas', 'saude-estetica', 'outros'))",
  ],
};
