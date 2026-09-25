import { site } from '../config/site';

type Intent = 'test-drive' | 'price' | 'credit' | 'registration';

const copy: Record<Intent, { title: string; text: string; submit: string }> = {
  'test-drive': {
    title: 'Записаться на тест-драйв',
    text: 'Оставьте телефон — подберём удобное время и подготовим автомобиль.',
    submit: 'Записаться на тест-драйв',
  },
  price: {
    title: 'Получить предложение',
    text: 'Рассчитаем точную стоимость комплектации на учёте РФ и КР и расскажем о наличии.',
    submit: 'Получить предложение',
  },
  credit: {
    title: 'Одобрение кредита',
    text: 'Подберём банк с подходящими условиями и перезвоним с расчётом.',
    submit: 'Отправить заявку',
  },
  registration: {
    title: 'Консультация по учёту',
    text: 'Объясним разницу между учётом РФ и КР и посчитаем оба варианта для вас.',
    submit: 'Получить консультацию',
  },
};

// --- UTM и источники трафика: запоминаем первое касание на время сессии ---
const TRACK_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'fbclid'];

function readTracking(): Record<string, string> {
  const params = new URLSearchParams(location.search);
  const fresh: Record<string, string> = {};
  TRACK_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) fresh[k] = v;
  });
  try {
    const saved = JSON.parse(sessionStorage.getItem('pa_tracking') || 'null');
    if (saved && !Object.keys(fresh).length) return saved;
    const data = { ...fresh, referrer: document.referrer, landing: location.pathname };
    sessionStorage.setItem('pa_tracking', JSON.stringify(data));
    return data;
  } catch {
    return { ...fresh, referrer: document.referrer, landing: location.pathname };
  }
}

const tracking = readTracking();

// --- Маска телефона +7 (XXX) XXX-XX-XX ---
function phoneDigits(value: string): string {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (d.startsWith('9')) d = '7' + d;
  return d.slice(0, 11);
}

function formatPhone(value: string): string {
  const d = phoneDigits(value);
  if (!d) return '';
  const p = d.slice(1);
  let out = '+7';
  if (p.length) out += ' (' + p.slice(0, 3);
  if (p.length >= 3) out += ')';
  if (p.length > 3) out += ' ' + p.slice(3, 6);
  if (p.length > 6) out += '-' + p.slice(6, 8);
  if (p.length > 8) out += '-' + p.slice(8, 10);
  return out;
}

document.querySelectorAll<HTMLInputElement>('[data-phone]').forEach((input) => {
  input.addEventListener('input', () => {
    input.value = formatPhone(input.value);
    input.closest('.field')?.classList.remove('is-invalid');
  });
  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7 (';
  });
  input.addEventListener('blur', () => {
    if (phoneDigits(input.value).length <= 1) input.value = '';
  });
});

// --- Модальное окно ---
const modal = document.querySelector<HTMLDialogElement>('[data-lead-modal]');

function setIntent(form: HTMLFormElement, intent: Intent) {
  (form.elements.namedItem('intent') as HTMLInputElement).value = intent;
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  if (submit) submit.textContent = copy[intent].submit;
}

function resetForm(form: HTMLFormElement) {
  form.reset();
  form.querySelector<HTMLElement>('.lead-form__done')!.hidden = true;
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  form.querySelector('.lead-form__status')!.textContent = '';
}

document.addEventListener('click', (e) => {
  const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-open-lead]');
  if (!trigger || !modal) return;
  const form = modal.querySelector<HTMLFormElement>('[data-lead-form]')!;
  const intent = (trigger.dataset.intent as Intent) || 'test-drive';
  resetForm(form);
  setIntent(form, intent);
  modal.querySelector('[data-lead-title]')!.textContent = copy[intent].title;
  modal.querySelector('[data-lead-text]')!.textContent = copy[intent].text;
  const trim = form.elements.namedItem('trim') as HTMLSelectElement | null;
  if (trim) trim.value = trigger.dataset.trim ?? '';
  modal.showModal();
  document.documentElement.classList.add('modal-open');
  reachGoal('lead_open', { intent });
});

modal?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target === modal || target.closest('[data-close-lead]')) modal.close();
});
modal?.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));

// --- Отправка ---
function reachGoal(goal: string, params?: Record<string, unknown>) {
  const w = window as unknown as { ym?: (...args: unknown[]) => void; __ymId?: string };
  if (w.ym && w.__ymId) w.ym(w.__ymId, 'reachGoal', goal, params);
}

/** true — заявка ушла в CRM, false — демо-режим (адрес не настроен) */
async function sendLead(payload: Record<string, unknown>): Promise<boolean> {
  if (!site.leadEndpoint) {
    console.info('[lead] demo mode, payload:', payload);
    await new Promise((r) => setTimeout(r, 700));
    return false;
  }
  const res = await fetch(site.leadEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

document.querySelectorAll<HTMLFormElement>('[data-lead-form]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const status = form.querySelector('.lead-form__status')!;
    status.textContent = '';

    if (data.get('company')) return; // бот заполнил скрытое поле

    const phoneInput = form.querySelector<HTMLInputElement>('[data-phone]')!;
    const consent = form.querySelector<HTMLInputElement>('[name="consent"]')!;
    const phoneOk = phoneDigits(phoneInput.value).length === 11;
    phoneInput.closest('.field')!.classList.toggle('is-invalid', !phoneOk);
    consent.closest('.consent')!.classList.toggle('is-invalid', !consent.checked);
    if (!phoneOk) return phoneInput.focus();
    if (!consent.checked) {
      status.textContent = 'Нужно согласие на обработку персональных данных';
      return;
    }

    const payload = {
      name: String(data.get('name') || '').trim(),
      phone: '+' + phoneDigits(phoneInput.value),
      model: data.get('model'),
      trim: data.get('trim') || '',
      intent: data.get('intent'),
      page: location.href,
      createdAt: new Date().toISOString(),
      ...tracking,
    };

    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
    submit.disabled = true;
    try {
      const sent = await sendLead(payload);
      const done = form.querySelector<HTMLElement>('.lead-form__done')!;
      if (!sent) {
        done.querySelector('.lead-form__done-title')!.textContent = 'Это демо-версия';
        done.querySelector('p:last-child')!.textContent =
          'Заявка никуда не отправлена. На рабочем сайте она сразу придёт менеджеру.';
      }
      done.hidden = false;
      reachGoal('lead_submit', { intent: payload.intent });
    } catch {
      status.textContent = `Не удалось отправить заявку. Позвоните нам: ${site.phone}`;
    } finally {
      submit.disabled = false;
    }
  });
});
