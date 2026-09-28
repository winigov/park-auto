// Выпадающие списки в стиле сайта вместо системных.
// Исходный <select> остаётся в форме (скрытым): его значение уходит с заявкой, его читают и меняют
// другие скрипты (калькулятор, окно заявки). Интерфейс подстраивается под эти изменения сам.
// Без JS работает обычный системный список.

const CHEVRON =
  '<svg class="ui-select__chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const CHECK =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const valueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!;
let uid = 0;

/** Открывает меню вверх или влево, если внизу / справа не хватает места (учитывает окно заявки) */
export function placeMenu(menu: HTMLElement, anchor: HTMLElement) {
  menu.classList.remove('is-up', 'is-right');
  const box = anchor.closest('dialog')?.getBoundingClientRect() ?? { top: 0, bottom: innerHeight };
  const a = anchor.getBoundingClientRect();
  const m = menu.getBoundingClientRect();
  const below = Math.min(innerHeight, box.bottom) - a.bottom;
  const above = a.top - Math.max(0, box.top);
  if (m.height + 16 > below && above > below) menu.classList.add('is-up');
  if (m.right > document.documentElement.clientWidth - 12) menu.classList.add('is-right');
}

function enhance(select: HTMLSelectElement) {
  const n = ++uid;
  const wrap = document.createElement('div');
  wrap.className = 'ui-select';
  select.before(wrap);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ui-select__btn';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');
  const value = document.createElement('span');
  value.className = 'ui-select__value';
  value.id = `ui-select-${n}-value`;
  btn.append(value);
  btn.insertAdjacentHTML('beforeend', CHEVRON);

  const menu = document.createElement('ul');
  menu.className = 'ui-menu';
  menu.id = `ui-select-${n}-list`;
  menu.setAttribute('role', 'listbox');
  btn.setAttribute('aria-controls', menu.id);

  // подпись поля (<label><span>Модель</span><select>) — имя и для кнопки, и для списка
  const caption = select.closest('label')?.querySelector<HTMLElement>(':scope > span');
  if (caption) {
    caption.id ||= `ui-select-${n}-label`;
    btn.setAttribute('aria-labelledby', `${caption.id} ${value.id}`);
    menu.setAttribute('aria-labelledby', caption.id);
    caption.addEventListener('click', (e) => {
      e.preventDefault();
      btn.focus();
    });
  }

  select.hidden = true;
  select.tabIndex = -1;
  wrap.append(select, btn, menu);

  const options = () => [...menu.querySelectorAll<HTMLElement>('[role="option"]')];

  const build = () => {
    menu.replaceChildren(
      ...[...select.options].map((o) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.tabIndex = -1;
        li.dataset.value = o.value;
        li.textContent = o.text;
        li.insertAdjacentHTML('beforeend', CHECK);
        return li;
      }),
    );
  };

  const render = () => {
    const current = select.selectedOptions[0];
    value.textContent = current?.text ?? '';
    wrap.classList.toggle('is-placeholder', !current || current.value === '');
    options().forEach((li) => li.setAttribute('aria-selected', String(li.dataset.value === select.value)));
  };

  // программная смена значения (select.value = …) — сразу обновляем подпись
  Object.defineProperty(select, 'value', {
    configurable: true,
    get: () => valueDesc.get!.call(select),
    set: (v: string) => {
      valueDesc.set!.call(select, v);
      render();
    },
  });
  // замена пунктов (калькулятор меняет список комплектаций) и сброс формы
  new MutationObserver(() => {
    build();
    render();
  }).observe(select, { childList: true, subtree: true });
  select.form?.addEventListener('reset', () => setTimeout(render));

  const close = (focusBtn = false) => {
    if (!wrap.classList.contains('is-open')) return;
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    if (focusBtn) btn.focus();
  };

  const open = () => {
    document.querySelectorAll<HTMLElement>('.ui-select.is-open').forEach((w) => w !== wrap && w.dispatchEvent(new Event('ui-close')));
    build(); // пункты — всегда по актуальному списку
    render();
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    placeMenu(menu, btn);
    (options().find((li) => li.getAttribute('aria-selected') === 'true') ?? options()[0])?.focus();
  };

  const choose = (v: string) => {
    if (v !== select.value) {
      select.value = v;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    close(true);
  };

  wrap.addEventListener('ui-close', () => close());
  btn.addEventListener('click', () => (wrap.classList.contains('is-open') ? close() : open()));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open();
    } else if (e.key === 'Escape') close(true);
  });

  menu.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    if (li) choose(li.dataset.value!);
  });
  menu.addEventListener('keydown', (e) => {
    const opts = options();
    const i = opts.indexOf(document.activeElement as HTMLElement);
    const go = (k: number) => {
      e.preventDefault();
      opts[(k + opts.length) % opts.length].focus();
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(opts.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (i >= 0) choose(opts[i].dataset.value!);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // Esc закрывает меню, а не окно заявки целиком
      close(true);
    } else if (e.key === 'Tab') close();
  });

  build();
  render();
}

export function enhanceSelects(root: ParentNode = document) {
  root.querySelectorAll<HTMLSelectElement>('select:not([data-native])').forEach((s) => {
    if (s.closest('.ui-select')) return;
    enhance(s);
  });
}

// клик мимо открытого меню закрывает его
document.addEventListener('click', (e) => {
  document.querySelectorAll<HTMLElement>('.ui-select.is-open').forEach((w) => {
    if (!w.contains(e.target as Node)) w.dispatchEvent(new Event('ui-close'));
  });
});

enhanceSelects();
