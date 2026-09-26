import type { CarModel } from '../types';
import geelyM7 from './geely-m7';
import liL9 from './li-l9';

// Новая модель = файл в этой папке + строка в списке ниже.
// Страница /<slug>/, карточка в каталоге, пункт в меню «Модели» и опции в формах появятся сами.
const all: CarModel[] = [geelyM7, liL9];

export const models = [...all].sort((a, b) => (a.order ?? 100) - (b.order ?? 100));

/** Модели для первого экрана главной. Если ни одна не отмечена — первые три из каталога. */
export const featuredModels = models.some((m) => m.featured) ? models.filter((m) => m.featured) : models.slice(0, 3);
