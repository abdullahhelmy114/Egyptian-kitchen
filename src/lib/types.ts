export type Lang = "ar" | "tr" | "en";

export type Category = "main" | "extra";

export type DayKey =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export interface Dish {
  id: string;
  name_ar: string;
  name_tr: string;
  name_en: string;
  category: Category;
  image_url: string | null;
}

export interface DishAvailability {
  id: string;
  dish_id: string;
  day_of_week: DayKey;
  price: number;
  is_available: boolean;
}

export interface DishWithPrice {
  dish: Dish;
  price: number;
  availability_id: string;
}
