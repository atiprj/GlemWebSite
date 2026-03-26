import en from "@/messages/en.json";
import it from "@/messages/it.json";

export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];

export const dictionaries: Record<Locale, Record<string, string>> = {
  it,
  en
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
