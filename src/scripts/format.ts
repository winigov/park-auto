const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

export function formatPrice(value: number): string {
  return `${rub.format(value)} ₽`;
}

export function minPrice(trims: { prices: { rf: number; kg: number } }[], kind: 'rf' | 'kg'): number {
  return Math.min(...trims.map((t) => t.prices[kind]));
}

export function maxPrice(trims: { prices: { rf: number; kg: number } }[], kind: 'rf' | 'kg'): number {
  return Math.max(...trims.map((t) => t.prices[kind]));
}

/** plural(5, ['модель', 'модели', 'моделей']) → 'моделей' */
export function plural(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
  return forms[2];
}
