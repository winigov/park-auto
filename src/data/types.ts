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

export interface Chapter {
  eyebrow: string;
  title: string;
  text: string;
  photo: Photo;
}

export interface CarModel {
  slug: string;
  brand: string;
  name: string;
  fullName: string;
  bodyType: string;
  powertrain: string;
  year: number;
  tagline: string;
  lead: string;
  hero: Photo;
  stats: Stat[];
  /** Сноска под цифрами: источник, цикл измерения */
  statsNote: string;
  chapters: Chapter[];
  interior: {
    title: string;
    text: string;
    photo: Photo;
    features: { title: string; text: string }[];
  };
  tech: {
    title: string;
    text: string;
    points: { value: string; label: string }[];
  };
  gallery: Photo[];
  /** Фон блока с формой тест-драйва */
  ctaPhoto: Photo;
  specs: { group: string; items: Spec[] }[];
  specsNote: string;
  trims: Trim[];
  colors: { name: string; hex: string }[];
  faq: { q: string; a: string }[];
  seo: { title: string; description: string };
}
