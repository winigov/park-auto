// Сайт может жить в подпапке (например, на GitHub Pages: /park-auto/), поэтому внутренние ссылки строим от BASE_URL.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const path = (p: string) => `${base}${p}`;

export const absUrl = (p: string, site: URL | undefined) => new URL(path(p), site).href;
