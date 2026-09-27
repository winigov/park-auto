import type { ImageMetadata } from 'astro';

export interface Photo {
  src?: ImageMetadata;
  alt: string;
  /** Подпись плейсхолдера: какой кадр нужен, пока фото нет */
  shot: string;
  /** Точка фокуса при кадрировании (object-position), например '70% 55%' */
  focus?: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Stat {
  value: number;
  decimals?: number;
  prefix?: string;
  unit: string;
  label: string;
}

export interface Trim {
  id: string;
  name: string;
  subtitle: string;
  /** Предварительные цены, ₽ */
  prices: { rf: number; kg: number };
  features: string[];
  popular?: boolean;
}

/** Карточка в блоке «Возможности»: фото функции с подписью */
export interface Feature {
  title: string;
  text: string;
  photo: Photo;
  /** Размер в сетке: normal — треть ряда, wide — две трети, tall — треть ширины на два ряда */
  size?: 'normal' | 'wide' | 'tall';
}

/** Цвет с живым фото — для блока «Цвета» */
export interface ColorPhoto {
  name: string;
  /** Цвет кружка-переключателя (можно градиент для двухцветных) */
  hex: string;
  photo: Photo;
}

export interface Chapter {
  eyebrow: string;
  title: string;
  text: string;
  photo: Photo;
}

/** Тип кузова — по нему фильтруется каталог */
export type BodyKind = 'crossover' | 'suv' | 'minivan' | 'sedan' | 'hatchback' | 'pickup';

/** Силовая установка — по ней фильтруется каталог */
export type EnergyKind = 'phev' | 'erev' | 'ev' | 'hev' | 'ice';

export const bodyLabels: Record<BodyKind, string> = {
  crossover: 'Кроссовер',
  suv: 'Внедорожник',
  minivan: 'Минивэн',
  sedan: 'Седан',
  hatchback: 'Хэтчбек',
  pickup: 'Пикап',
};

export const energyLabels: Record<EnergyKind, string> = {
  phev: 'Подзаряжаемый гибрид',
  erev: 'Гибрид с увеличителем запаса хода',
  ev: 'Электромобиль',
  hev: 'Гибрид',
  ice: 'Бензин',
};

/** Короткие подписи для фильтров и карточек */
export const energyShort: Record<EnergyKind, string> = {
  phev: 'Гибрид PHEV',
  erev: 'Гибрид EREV',
  ev: 'Электро',
  hev: 'Гибрид',
  ice: 'Бензин',
};

/**
 * Модель в каталоге. Обязательное — то, что нужно карточке и базовой странице.
 * Промо-блоки (chapters, interior, tech, gallery) необязательны: страница покажет только заполненные.
 */
export interface CarModel {
  slug: string;
  brand: string;
  name: string;
  year: number;
  body: BodyKind;
  energy: EnergyKind;
  /** Если модель продаётся с разными двигателями (например, бензин и гибрид) — все варианты, для фильтра и карточки */
  energyOptions?: EnergyKind[];
  seats: number;
  availability: 'in-stock' | 'on-order';
  isNew?: boolean;
  /** Показывать на первом экране главной */
  featured?: boolean;
  /** Порядок в каталоге: меньше — выше */
  order?: number;

  tagline: string;
  lead: string;
  hero: Photo;
  /** На сколько процентов опустить фото первого экрана, если машина в кадре стоит высоко и заголовок ложится на неё */
  heroOffset?: number;
  /** Три коротких цифры для карточки в каталоге */
  highlights: { value: string; label: string }[];
  stats: Stat[];
  /** Сноска под цифрами: источник, цикл измерения */
  statsNote: string;

  /** Блок «Возможности» — главное, чем модель удобна и полезна (идёт сразу после цифр) */
  features?: Feature[];
  featuresTitle?: string;
  featuresLead?: string;
  /** Сноска под блоком: например, что оснащение зависит от комплектации */
  featuresNote?: string;
  /** Блок «Цвета» с живыми фото */
  colorPhotos?: ColorPhoto[];
  colorsNote?: string;

  chapters?: Chapter[];
  interior?: {
    title: string;
    text: string;
    photo: Photo;
    features: { title: string; text: string }[];
  };
  tech?: {
    title: string;
    text: string;
    points: { value: string; label: string }[];
  };
  gallery?: Photo[];
  /** Фон блока с формой тест-драйва (по умолчанию — hero) */
  ctaPhoto?: Photo;

  specs: { group: string; items: Spec[] }[];
  specsNote: string;
  trims: Trim[];
  colors: { name: string; hex: string }[];
  faq?: { q: string; a: string }[];
  seo: { title: string; description: string };
}

export const fullName = (m: Pick<CarModel, 'brand' | 'name'>) => `${m.brand} ${m.name}`;

/** Все варианты двигателя модели */
export const energiesOf = (m: Pick<CarModel, 'energy' | 'energyOptions'>): EnergyKind[] =>
  m.energyOptions?.length ? m.energyOptions : [m.energy];

/** Подпись двигателя для карточек: «Бензин / Гибрид» */
export const energyText = (m: Pick<CarModel, 'energy' | 'energyOptions'>) => energiesOf(m).map((e) => energyShort[e]).join(' / ');
