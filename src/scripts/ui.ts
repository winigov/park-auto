import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Шапка: прозрачная над первым экраном, «стеклянная» после ---
const header = document.querySelector<HTMLElement>('[data-header]');
const hero = document.querySelector<HTMLElement>('[data-hero]');

function syncHeader() {
  if (!header) return;
  const threshold = hero ? hero.offsetHeight - header.offsetHeight - 40 : -1;
  header.classList.toggle('is-solid', window.scrollY > threshold);
}
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });
window.addEventListener('resize', syncHeader);

// --- Мобильное меню ---
const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
burger?.addEventListener('click', () => {
  const open = header!.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('#site-nav a').forEach((a) =>
  a.addEventListener('click', () => {
    header?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  }),
);

// --- Мобильная панель: прячем, когда форма тест-драйва уже на экране ---
const mbar = document.querySelector<HTMLElement>('[data-mbar]');
const leadSection = document.querySelector('#test-drive');
if (mbar && leadSection) {
  new IntersectionObserver(([entry]) => mbar.classList.toggle('is-hidden', entry.isIntersecting), {
    threshold: 0.25,
  }).observe(leadSection);
}

// --- История модели: какой кадр показывать в «липком» окне ---
const storyImgs = document.querySelectorAll<HTMLElement>('[data-story-img]');
if (storyImgs.length) {
  const steps = document.querySelectorAll<HTMLElement>('[data-story-step]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = (entry.target as HTMLElement).dataset.storyStep;
        storyImgs.forEach((img) => img.classList.toggle('is-active', img.dataset.storyImg === i));
      });
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  steps.forEach((s) => io.observe(s));
}

// --- Анимации ---
const countEls = document.querySelectorAll<HTMLElement>('[data-count]');

if (!reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  // Появление блоков
  gsap.set('[data-reveal]', { opacity: 0, y: 32 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });

  // Первый экран: плавный вход и параллакс при прокрутке
  if (hero) {
    const bg = hero.querySelector<HTMLElement>('[data-hero-bg]')!;
    const blocks = hero.querySelectorAll<HTMLElement>('[data-hero-content]');
    const items = [...blocks].flatMap((b) => [...b.children]);
    gsap.from(items, { opacity: 0, y: 36, duration: 1, stagger: 0.09, ease: 'power3.out', delay: 0.15 });

    // Фото проявляется, когда реально загрузилось (но не дольше 2,5 с ожидания)
    const photo = bg.firstElementChild as HTMLElement;
    const img = bg.querySelector('img');
    const loaded =
      img && !img.complete
        ? Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 2500))])
        : Promise.resolve();
    gsap.set(photo, { opacity: 0, scale: 1.12 });
    loaded.then(() => gsap.to(photo, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }));

    gsap.to(bg, {
      yPercent: 10,
      scale: 1.06,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to(blocks, {
      opacity: 0,
      y: -60,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: '20% top', end: '75% top', scrub: true },
    });
  }

  // Счётчики цифр
  countEls.forEach((el) => {
    const end = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const fmt = (v: number) =>
      v.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const state = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(state, {
      v: end,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = fmt(state.v)),
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  // Салон: фото «раскрывается» до полного экрана
  document.querySelectorAll<HTMLElement>('[data-expand]').forEach((stage) => {
    const target = stage.querySelector<HTMLElement>('[data-expand-target]');
    if (!target) return;
    const inset = window.innerWidth < 720 ? '4% 4% 4% 4%' : '8% 14% 8% 14%';
    gsap.fromTo(
      target,
      { clipPath: `inset(${inset} round 28px)` },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top 85%', end: 'center 55%', scrub: true },
      },
    );
    const media = target.querySelector('.media');
    if (media) {
      gsap.fromTo(
        media,
        { scale: 1.18 },
        { scale: 1, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    }
  });
}
