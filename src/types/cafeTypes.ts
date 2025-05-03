
export type LanguageType = "fr" | "en";

export interface MultiLanguageText {
  fr: string;
  en: string;
}

export interface CategoryType {
  id: string;
  name: MultiLanguageText;
}

export interface ProductType {
  id: string;
  name: MultiLanguageText;
  price: number;
  categoryId: string;
  image: string;
}

export interface OrderItemType {
  productId: string;
  name: MultiLanguageText;
  price: number;
  quantity: number;
  image: string;
}
