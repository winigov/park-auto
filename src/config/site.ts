// Данные компании. Всё, что помечено TODO, — плейсхолдеры до получения реальных данных от «Парк Авто».

export const site = {
  name: 'Парк Авто',
  legalName: 'ООО «Парк Авто»', // TODO: юрлицо, ИНН, ОГРН
  inn: '0000000000', // TODO
  city: 'Махачкала',
  region: 'Республика Дагестан',
  address: 'г. Махачкала, адрес уточняется', // TODO
  geo: { lat: 42.9849, lon: 47.5047 }, // TODO: координаты площадки
  hours: 'Ежедневно 9:00–20:00', // TODO
  phone: '+7 (900) 000-00-00', // TODO
  phoneHref: 'tel:+79000000000', // TODO
  whatsapp: 'https://wa.me/79000000000', // TODO
  telegram: 'https://t.me/', // TODO
  instagram: 'https://instagram.com/', // TODO
  email: 'info@park-auto.example', // TODO

  // Ориентир для кредитного калькулятора. TODO: условия банка-партнёра.
  credit: {
    rate: 19.9,
    minDownPercent: 0,
    maxTermMonths: 84,
    bank: 'банки-партнёры',
  },

  leadEndpoint: import.meta.env.PUBLIC_LEAD_ENDPOINT ?? '',
  /** Демо-версия: плашка «прототип» и запрет индексации */
  demo: import.meta.env.PUBLIC_DEMO === '1',
  metrikaId: import.meta.env.PUBLIC_YM_ID ?? '',
};

export type Site = typeof site;
