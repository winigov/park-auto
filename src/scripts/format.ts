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
