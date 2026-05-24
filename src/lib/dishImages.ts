import mandi from "@/assets/dish-mandi.jpg";
import peppers from "@/assets/dish-peppers.jpg";
import eggplants from "@/assets/dish-eggplants.jpg";
import mixedStuffed from "@/assets/dish-mixed-stuffed.jpg";
import stuffedChicken from "@/assets/dish-stuffed-chicken.jpg";
import chickenRice from "@/assets/dish-chicken-rice.jpg";
import bechamelChicken from "@/assets/dish-bechamel-chicken.jpg";
import bechamelMeat from "@/assets/dish-bechamel-meat.jpg";
import katmer from "@/assets/dish-katmer.jpg";
import bread from "@/assets/dish-bread.jpg";
import rizmidi from "@/assets/dish-rizmidi.jpg";
import beans from "@/assets/dish-beans.jpg";
import molokhia from "@/assets/dish-molokhia.jpg";
import orzo from "@/assets/dish-orzo.jpg";
import pide from "@/assets/dish-pide.jpg";
import ricePudding from "@/assets/dish-rice-pudding.jpg";
import kafha from "@/assets/dish-kafha.jpg";

export const DISH_IMAGES: Record<string, string> = {
  mandi,
  peppers,
  eggplants,
  "mixed-stuffed": mixedStuffed,
  "stuffed-chicken": stuffedChicken,
  "chicken-rice": chickenRice,
  "bechamel-chicken": bechamelChicken,
  "bechamel-meat": bechamelMeat,
  katmer,
  bread,
  rizmidi,
  beans,
  molokhia,
  orzo,
  pide,
  "rice-pudding": ricePudding,
  kafha,
};

export function getDishImage(key: string | null | undefined): string | null {
  if (!key) return null;
  return DISH_IMAGES[key] ?? null;
}
