/* ==========================================================================
   Global Tech Infrastructure: interface behaviour
   Plain ES2020, no dependencies. Every module checks for its own markup,
   so a missing section never stops the rest of the page from working.
   ========================================================================== */

(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const DATA = window.GTI_DATA || null;
  const CONTACT = DATA ? DATA.contact : {
    email: 'info.remotie@gmail.com',
    phone: '+61438650449',
    phoneDisplay: '+61 438 650 449',
    timeZone: 'Australia/Perth'
  };
  const TIME_ZONE = CONTACT.timeZone || 'Australia/Perth';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => motionQuery.matches;

  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  /* ------------------------------------------------------------------
     Shared helpers
     ------------------------------------------------------------------ */

  let scrollHolds = 0;

  function holdScroll() {
    if (scrollHolds === 0) {
      const gap = window.innerWidth - root.clientWidth;
      root.style.setProperty('--scrollbar-comp', gap + 'px');
      root.classList.add('is-locked');
    }
    scrollHolds += 1;
  }

  function releaseScroll() {
    scrollHolds = Math.max(0, scrollHolds - 1);
    if (scrollHolds === 0) {
      root.classList.remove('is-locked');
      root.style.removeProperty('--scrollbar-comp');
    }
  }

  function trapFocus(event, container) {
    const items = $$(FOCUSABLE, container).filter((el) => el.getClientRects().length > 0);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (!container.contains(active)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function replaceHash(hash) {
    try {
      history.replaceState(null, '', hash);
    } catch (error) {
      /* Some sandboxed previews block history updates. The page still works. */
    }
  }

  function scrollToId(id, smooth) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: smooth && !reduceMotion() ? 'smooth' : 'auto', block: 'start' });
  }

  /* Current day, hour and minute in Perth (AWST, no daylight saving). */
  function perthParts(date) {
    const parts = new Intl.DateTimeFormat('en-AU', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date || new Date());
    const get = (type) => (parts.find((p) => p.type === type) || {}).value || '';
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: days[get('weekday').slice(0, 3)] ?? new Date().getDay(),
      hour: parseInt(get('hour'), 10) % 24,
      minute: parseInt(get('minute'), 10),
      hhmm: get('hour').padStart(2, '0') + ':' + get('minute').padStart(2, '0')
    };
  }

  function perthClockLabel() {
    return new Intl.DateTimeFormat('en-AU', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date()) + ' AWST';
  }

  function buildMailto(subject, body) {
    const crlf = (text) => text.replace(/\r?\n/g, '\r\n');
    return 'mailto:' + CONTACT.email +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(crlf(body));
  }

  function humanList(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }

  function watchImage(img) {
    const fail = () => img.classList.add('is-broken');
    const ok = () => img.classList.remove('is-broken');
    img.addEventListener('error', fail);
    img.addEventListener('load', ok);
    if (img.complete && img.getAttribute('src') && img.naturalWidth === 0) fail();
  }

  /* ------------------------------------------------------------------
     Toast notifications
     ------------------------------------------------------------------ */

  const toastRegion = $('[data-toast-region]');

  function showToast(message, type) {
    if (!toastRegion) return;
    const tone = type === 'error' ? 'error' : 'success';
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + tone;

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'icon');
    icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', tone === 'error' ? '#i-cross-circle' : '#i-check-circle');
    icon.appendChild(use);

    const text = document.createElement('p');
    text.textContent = message;

    toast.append(icon, text);
    toastRegion.appendChild(toast);

    while (toastRegion.children.length > 3) {
      toastRegion.firstElementChild.remove();
    }

    void toast.offsetWidth;
    toast.classList.add('is-visible');

    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 400);
    };
    window.setTimeout(remove, 4200);
    toast.addEventListener('click', remove);
  }

  /* ------------------------------------------------------------------
     Clipboard
     ------------------------------------------------------------------ */

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      /* Fall through to the legacy method below. */
    }

    const previous = document.activeElement;
    const proxy = document.createElement('textarea');
    proxy.value = text;
    proxy.setAttribute('readonly', '');
    proxy.className = 'clipboard-proxy';
    document.body.appendChild(proxy);
    proxy.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (error) {
      ok = false;
    }
    proxy.remove();
    if (previous && typeof previous.focus === 'function') previous.focus({ preventScroll: true });
    return ok;
  }

  function initCopyButtons() {
    $$('[data-copy]').forEach((button) => {
      button.addEventListener('click', async () => {
        const value = button.getAttribute('data-copy');
        const label = button.getAttribute('data-copy-label') || 'Text';
        const shown = value === CONTACT.phone ? CONTACT.phoneDisplay : value;
        const ok = await copyText(shown);
        if (ok) {
          button.classList.add('is-copied');
          window.setTimeout(() => button.classList.remove('is-copied'), 1800);
          showToast(label + ' copied: ' + shown);
        } else {
          showToast('Copying is blocked in this browser. The ' + label.toLowerCase() + ' is ' + shown + '.', 'error');
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Header: scroll state and section spy
     ------------------------------------------------------------------ */

  function initHeader() {
    const header = $('#site-header');
    if (!header) return;

    const setHeight = () => root.style.setProperty('--header-h', header.offsetHeight + 'px');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);

    setHeight();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', setHeight);
  }

  function initSectionSpy() {
    const links = $$('[data-spy]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const aliases = { dispatch: 'contact' };
    const setActive = (id) => {
      links.forEach((link) => {
        const on = link.getAttribute('data-spy') === id;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        setActive(aliases[id] || id);
      });
    }, { rootMargin: '-45% 0px -54% 0px' });

    ['home', 'metrics', 'services', 'why-us', 'industries', 'estimator', 'reviews', 'contact', 'dispatch', 'faq']
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .forEach((section) => observer.observe(section));
  }

  /* ------------------------------------------------------------------
     Mobile drawer with focus trap
     ------------------------------------------------------------------ */

  function initDrawer() {
    const toggle = $('.menu-toggle');
    const drawer = $('#mobile-drawer');
    const backdrop = $('[data-drawer-backdrop]');
    if (!toggle || !drawer || !backdrop) return;

    let isOpen = false;
    let returnFocus = null;

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      } else if (event.key === 'Tab') {
        trapFocus(event, drawer);
      }
    };

    function open() {
      if (isOpen) return;
      isOpen = true;
      returnFocus = document.activeElement;
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      holdScroll();
      document.addEventListener('keydown', onKey);
      window.requestAnimationFrame(() => {
        const first = $(FOCUSABLE, drawer);
        if (first) first.focus();
      });
    }

    function close(restore) {
      if (!isOpen) return;
      isOpen = false;
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      releaseScroll();
      document.removeEventListener('keydown', onKey);
      if (restore && returnFocus) returnFocus.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', () => (isOpen ? close(true) : open()));
    backdrop.addEventListener('click', () => close(true));
    $$('[data-drawer-close]', drawer).forEach((btn) => btn.addEventListener('click', () => close(true)));
    $$('a[href]', drawer).forEach((link) => link.addEventListener('click', () => close(false)));

    const desktop = window.matchMedia('(min-width: 1100px)');
    const onBreakpoint = () => { if (desktop.matches) close(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  }

  /* ------------------------------------------------------------------
     Scroll reveal and metric counters
     ------------------------------------------------------------------ */

  function initReveal() {
    const items = $$('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion()) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach((el) => observer.observe(el));
  }

  function initCounters() {
    const counters = $$('[data-count]');
    const list = $('.metrics__list');
    if (!counters.length || !list) return;

    const format = (value, decimals) => value.toLocaleString('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    counters.forEach((el) => {
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const target = parseFloat(el.getAttribute('data-count'));
      const spoken = document.createElement('span');
      spoken.className = 'visually-hidden';
      spoken.textContent = format(target, decimals);
      el.after(spoken);
      el.setAttribute('aria-hidden', 'true');
    });

    if (!('IntersectionObserver' in window) || reduceMotion()) return;

    counters.forEach((el) => {
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      el.textContent = format(0, decimals);
    });

    const run = () => {
      counters.forEach((el, i) => {
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const target = parseFloat(el.getAttribute('data-count'));
        const duration = 1500 + i * 150;
        const start = performance.now() + i * 120;

        const tick = (now) => {
          const progress = Math.min(Math.max((now - start) / duration, 0), 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          el.textContent = format(target * eased, decimals);
          if (progress < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
    };

    const observer = new IntersectionObserver((entries, obs) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        run();
        obs.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(list);
  }

  /* ------------------------------------------------------------------
     Perth clocks and helpdesk status
     ------------------------------------------------------------------ */

  function initPerthClocks() {
    const short = $$('[data-awst-clock]');
    const long = $$('[data-perth-clock]');
    const status = $('[data-desk-status]');
    const text = $('[data-desk-text]');
    const hours = DATA ? DATA.deskHours : { weekday: { open: 7, close: 19 }, saturday: { open: 9, close: 13 } };

    const update = () => {
      const now = perthParts();
      short.forEach((el) => { el.textContent = now.hhmm; });
      const label = perthClockLabel();
      long.forEach((el) => { el.textContent = label; });

      if (!status || !text) return;
      const weekday = now.day >= 1 && now.day <= 5;
      const saturday = now.day === 6;
      let state = 'after-hours';
      let message = 'After hours: critical incidents answered 24/7';

      if (weekday && now.hour >= hours.weekday.open && now.hour < hours.weekday.close) {
        state = 'open';
        message = 'Helpdesk open now, average pickup under 45 seconds';
      } else if (saturday && now.hour >= hours.saturday.open && now.hour < hours.saturday.close) {
        state = 'open';
        message = 'Saturday desk open for booked work';
      }

      status.setAttribute('data-state', state);
      text.textContent = message;
    };

    /* Tick on each minute boundary so the clocks never lag behind real time. */
    const schedule = () => {
      window.setTimeout(() => {
        update();
        schedule();
      }, 60000 - (Date.now() % 60000) + 50);
    };

    update();
    schedule();
  }

  /* ------------------------------------------------------------------
     Services: filter chips and detail dialog
     ------------------------------------------------------------------ */

  function initServiceFilter() {
    const chips = $$('[data-filter]');
    const cards = $$('.service-card');
    const status = $('[data-filter-status]');
    if (!chips.length || !cards.length) return;

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const filter = chip.getAttribute('data-filter');
        chips.forEach((c) => {
          const on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });

        let shown = 0;
        cards.forEach((card) => {
          const categories = (card.getAttribute('data-category') || '').split(' ');
          const match = filter === 'all' || categories.includes(filter);
          card.hidden = !match;
          if (match) {
            shown += 1;
            card.classList.remove('is-entering');
            void card.offsetWidth;
            card.classList.add('is-entering');
          }
        });

        if (status) status.textContent = 'Showing ' + shown + (shown === 1 ? ' service' : ' services');
      });
    });
  }

  const serviceDialog = (function () {
    const dialog = $('#service-dialog');
    if (!dialog || !DATA) return null;

    const list = DATA.services;
    const scroller = $('[data-sd-scroll]', dialog);
    const image = $('[data-sd-image]', dialog);
    const iconUse = $('[data-sd-icon]', dialog);
    const tagEl = $('[data-sd-tag]', dialog);
    const titleEl = $('[data-sd-title]', dialog);
    const bodyEl = $('[data-sd-body]', dialog);
    const countEl = $('[data-sd-count]', dialog);
    const enquire = $('[data-sd-enquire]', dialog);

    let index = 0;
    let opener = null;
    let closing = false;

    if (image) watchImage(image);

    function el(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }

    function render(i) {
      const service = list[i];
      index = i;

      if (image && service.image) {
        image.classList.remove('is-broken');
        image.loading = 'eager';
        image.src = DATA.photo(service.image.id, 1200, 514);
        image.srcset = DATA.photo(service.image.id, 800, 343) + ' 800w, ' +
          DATA.photo(service.image.id, 1200, 514) + ' 1200w, ' +
          DATA.photo(service.image.id, 1800, 771) + ' 1800w';
        image.sizes = '(min-width: 960px) 920px, 100vw';
        image.alt = service.image.alt;
      }

      iconUse.setAttribute('href', '#' + service.icon);
      tagEl.textContent = service.tag;
      titleEl.textContent = service.title;
      countEl.textContent = (i + 1) + ' of ' + list.length;

      bodyEl.replaceChildren();
      bodyEl.appendChild(el('p', 'service-dialog__intro', service.intro));

      const grid = el('div', 'service-dialog__grid');

      const includedBlock = el('div', 'service-dialog__block');
      includedBlock.appendChild(el('h3', 'service-dialog__subhead', 'What’s included'));
      const ul = el('ul', 'ticks');
      service.included.forEach((item) => ul.appendChild(el('li', '', item)));
      includedBlock.appendChild(ul);

      const slaBlock = el('div', 'service-dialog__block');
      slaBlock.appendChild(el('h3', 'service-dialog__subhead', 'Service levels'));
      const dl = el('dl', 'sla-tiles');
      service.sla.forEach(([label, value]) => {
        const row = el('div');
        row.append(el('dt', '', label), el('dd', '', value));
        dl.appendChild(row);
      });
      slaBlock.appendChild(dl);

      const ideal = el('p', 'service-dialog__ideal');
      ideal.append(el('strong', '', 'Best for: '), document.createTextNode(service.idealFor));
      slaBlock.appendChild(ideal);

      grid.append(includedBlock, slaBlock);
      bodyEl.appendChild(grid);
      if (scroller) scroller.scrollTop = 0;
    }

    function open(slug, trigger) {
      const i = list.findIndex((s) => s.slug === slug);
      if (i < 0) return;
      render(i);
      if (!dialog.open) {
        opener = trigger || document.activeElement;
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        holdScroll();
      }
      replaceHash('#services/' + slug);
    }

    function close(options) {
      const opts = Object.assign({ restoreFocus: true, hash: '#services' }, options);
      if (!dialog.open || closing) return;
      closing = true;

      const finish = () => {
        if (!closing) return;
        closing = false;
        dialog.classList.remove('is-closing');
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
        releaseScroll();
        if (opts.hash) replaceHash(opts.hash);
        if (opts.restoreFocus && opener && document.contains(opener)) opener.focus({ preventScroll: true });
      };

      if (reduceMotion()) {
        finish();
      } else {
        dialog.classList.add('is-closing');
        window.setTimeout(finish, 220);
      }
    }

    function move(delta) {
      const next = (index + delta + list.length) % list.length;
      render(next);
      replaceHash('#services/' + list[next].slug);
    }

    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });

    dialog.addEventListener('keydown', (event) => {
      const tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    });

    $('[data-dialog-close]', dialog).addEventListener('click', () => close());
    $('[data-sd-prev]', dialog).addEventListener('click', () => move(-1));
    $('[data-sd-next]', dialog).addEventListener('click', () => move(1));

    if (enquire) {
      enquire.addEventListener('click', (event) => {
        event.preventDefault();
        const service = list[index];
        close({ restoreFocus: false, hash: '#contact' });

        const serviceSelect = $('#f-service');
        const message = $('#f-message');
        if (serviceSelect) serviceSelect.value = service.inquiryType;
        if (message && !message.value.trim()) {
          message.value = 'I’d like to talk about ' + service.title.replace(/&/g, 'and') + '. ';
          message.dispatchEvent(new Event('input', { bubbles: true }));
        }

        window.setTimeout(() => {
          scrollToId('contact', true);
          const first = $('#f-name');
          if (first) first.focus({ preventScroll: true });
        }, 240);
      });
    }

    $$('[data-open-service]').forEach((button) => {
      button.addEventListener('click', () => open(button.getAttribute('data-open-service'), button));
    });

    return { open: open, close: close };
  })();

  /* ------------------------------------------------------------------
     Industry tabs
     ------------------------------------------------------------------ */

  const industryTabs = (function () {
    const container = $('[data-tabs]');
    if (!container) return null;

    const tablist = $('[role="tablist"]', container);
    const tabs = $$('[role="tab"]', container);

    function select(tab, options) {
      const opts = Object.assign({ focus: false, updateHash: true }, options);
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !on;
        if (on) {
          panel.classList.remove('is-entering');
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        }
      });

      if (opts.focus) tab.focus();

      const left = tab.offsetLeft - 16;
      if (tablist.scrollWidth > tablist.clientWidth) {
        tablist.scrollTo({ left: Math.max(0, left), behavior: reduceMotion() ? 'auto' : 'smooth' });
      }

      if (opts.updateHash) replaceHash('#industries/' + tab.getAttribute('data-slug'));
    }

    tabs.forEach((tab) => tab.addEventListener('click', () => select(tab)));

    tablist.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = tabs[(current + 1) % tabs.length];
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = tabs[(current - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        select(next, { focus: true });
      }
    });

    return {
      selectBySlug(slug) {
        const tab = tabs.find((t) => t.getAttribute('data-slug') === slug);
        if (tab) select(tab, { updateHash: false });
        return Boolean(tab);
      }
    };
  })();

  /* ------------------------------------------------------------------
     Hash routing for sub-views: #services/<slug> and #industries/<slug>
     ------------------------------------------------------------------ */

  function handleRoute() {
    const hash = decodeURIComponent(window.location.hash || '');
    const match = hash.match(/^#(services|industries)\/([a-z0-9-]+)$/i);
    if (!match) return;
    const section = match[1].toLowerCase();
    const slug = match[2].toLowerCase();

    if (section === 'services' && serviceDialog) {
      scrollToId('services', false);
      serviceDialog.open(slug);
    } else if (section === 'industries' && industryTabs) {
      if (industryTabs.selectBySlug(slug)) scrollToId('industries', false);
    }
  }

  /* ------------------------------------------------------------------
     Service plan builder
     ------------------------------------------------------------------ */

  function initEstimator() {
    const form = $('[data-estimator]');
    const blueprint = $('#blueprint');
    if (!form || !blueprint || !DATA) return;

    const config = DATA.estimator;
    const range = $('#team-size', form);
    const output = $('#team-size-output', form);
    const tierEl = $('[data-bp-tier]', blueprint);
    const summaryEl = $('[data-bp-summary]', blueprint);
    const itemsEl = $('[data-bp-items]', blueprint);
    const emailLink = $('[data-bp-email]', blueprint);
    const copyBtn = $('[data-bp-copy]', blueprint);
    const fields = {
      p1: $('[data-bp-p1]', blueprint),
      hours: $('[data-bp-hours]', blueprint),
      onsite: $('[data-bp-onsite]', blueprint),
      uptime: $('[data-bp-uptime]', blueprint),
      onboard: $('[data-bp-onboard]', blueprint),
      reviews: $('[data-bp-reviews]', blueprint)
    };

    let lastTier = null;
    let latest = null;

    function readState() {
      const checked = $('input[name="priority"]:checked', form);
      return {
        size: parseInt(range.value, 10),
        priority: checked ? checked.value : 'full',
        extras: Object.keys(config.extras).filter((key) => form.elements[key] && form.elements[key].checked)
      };
    }

    function compute(state) {
      const priority = config.priorities[state.priority] || config.priorities.full;
      let tierIndex = config.sizeBreaks.filter((b) => state.size >= b).length;
      if (state.extras.includes('regulated') && (state.priority === 'security' || state.priority === 'full')) tierIndex += 1;
      tierIndex = Math.min(tierIndex, config.tiers.length - 1);

      const tier = Object.assign({}, config.tiers[tierIndex]);
      if (state.priority === 'support' && tierIndex < 2) tier.hours = '24/7 for every user';

      let onboarding = config.onboarding.find((o) => state.size <= o.max).text;
      if (state.priority === 'cloud') onboarding += ', plus migration';
      if (state.extras.includes('multisite') || state.extras.includes('regional')) onboarding += ', staged by site';

      const coverage = Object.assign({}, priority.coverage);
      state.extras.forEach((key) => {
        const boost = config.extras[key].boost;
        Object.keys(boost).forEach((area) => { coverage[area] = (coverage[area] || 0) + boost[area]; });
      });
      if (state.size >= 75) coverage.strategy += 1;
      Object.keys(coverage).forEach((area) => { coverage[area] = Math.min(4, Math.max(1, coverage[area])); });

      const items = priority.items.slice();
      state.extras.forEach((key) => items.push(config.extras[key].item));
      config.sizeItems.forEach((s) => { if (state.size >= s.min) items.push(s.text); });

      const sizeLabel = state.size >= 250 ? '250+' : String(state.size);
      const phrases = state.extras.map((key) => config.extras[key].phrase);
      const label = priority.label.charAt(0).toUpperCase() + priority.label.slice(1);
      const summary = label + ' for a team of ' + sizeLabel + (phrases.length ? ' ' + humanList(phrases) : '') + '.';

      return {
        tierIndex: tierIndex,
        tier: tier,
        onboarding: onboarding,
        coverage: coverage,
        items: [...new Set(items)],
        sizeLabel: sizeLabel,
        priorityLabel: label,
        extras: state.extras.map((key) => config.extras[key].label),
        summary: summary
      };
    }

    function planText(result) {
      const lines = [
        'Hi Global Tech Infrastructure team,',
        '',
        'I used the service plan builder on your website. Here is what it recommended:',
        '',
        'Recommended tier: ' + result.tier.name,
        'Team size: ' + result.sizeLabel + ' staff',
        'Main priority: ' + result.priorityLabel,
        'Also planning for: ' + (result.extras.length ? result.extras.join(', ') : 'Nothing extra'),
        '',
        'Service levels',
        '- Critical response: ' + result.tier.p1,
        '- Helpdesk hours: ' + result.tier.hours,
        '- On-site visits: ' + result.tier.onsite,
        '- Uptime target: ' + result.tier.uptime,
        '- Onboarding: ' + result.onboarding,
        '- Strategy reviews: ' + result.tier.reviews,
        '',
        'What you would put in place'
      ];
      result.items.forEach((item) => lines.push('- ' + item));
      lines.push('', 'Please get in touch so we can talk it through.', '', 'Name:', 'Company:', 'Phone:');
      return lines.join('\n');
    }

    function render() {
      const state = readState();
      const result = compute(state);
      latest = result;

      output.textContent = result.sizeLabel + ' staff';
      range.setAttribute('aria-valuetext', result.sizeLabel + ' staff');
      const pct = ((state.size - range.min) / (range.max - range.min)) * 100;
      range.style.setProperty('--fill', pct + '%');

      tierEl.textContent = result.tier.name;
      if (lastTier !== null && lastTier !== result.tierIndex) {
        tierEl.classList.remove('is-updated');
        void tierEl.offsetWidth;
        tierEl.classList.add('is-updated');
      }
      lastTier = result.tierIndex;

      summaryEl.textContent = result.summary;
      fields.p1.textContent = result.tier.p1;
      fields.hours.textContent = result.tier.hours;
      fields.onsite.textContent = result.tier.onsite;
      fields.uptime.textContent = result.tier.uptime;
      fields.onboard.textContent = result.onboarding;
      fields.reviews.textContent = result.tier.reviews;

      $$('[data-bar]', blueprint).forEach((row) => {
        const level = result.coverage[row.getAttribute('data-bar')] || 1;
        $('.bp-bar__fill', row).style.width = (level * 25) + '%';
        $('[data-bar-level]', row).textContent = config.levels[level];
      });

      itemsEl.replaceChildren();
      result.items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        itemsEl.appendChild(li);
      });

      const subject = 'IT service plan: ' + result.tier.name + ' tier for ' + result.sizeLabel + ' staff';
      emailLink.setAttribute('href', buildMailto(subject, planText(result)));
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    form.addEventListener('submit', (event) => event.preventDefault());

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        if (!latest) return;
        const ok = await copyText(planText(latest));
        if (ok) showToast('Plan copied. Paste it into an email to ' + CONTACT.email + '.');
        else showToast('Copying is blocked in this browser. Use Email this plan instead.', 'error');
      });
    }

    if (emailLink) {
      emailLink.addEventListener('click', () => {
        showToast('Opening your email app with the plan for ' + CONTACT.email + '.');
      });
    }

    render();
  }

  /* ------------------------------------------------------------------
     Testimonial carousel
     ------------------------------------------------------------------ */

  function initCarousel() {
    const carousel = $('[data-carousel]');
    if (!carousel) return;

    const viewport = $('[data-carousel-viewport]', carousel);
    const track = $('[data-carousel-track]', carousel);
    const slides = $$('.testimonial', track);
    const dotsWrap = $('[data-carousel-dots]', carousel);
    const prev = $('[data-carousel-prev]', carousel);
    const next = $('[data-carousel-next]', carousel);
    const currentEl = $('[data-carousel-current]', carousel);
    const totalEl = $('[data-carousel-total]', carousel);
    const total = slides.length;
    if (!total) return;

    let index = 0;
    const dots = slides.map((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', 'Show story ' + (i + 1) + ' of ' + total);
      dot.addEventListener('click', () => go(i));
      dotsWrap.appendChild(dot);
      return dot;
    });

    if (totalEl) totalEl.textContent = String(total);
    viewport.setAttribute('aria-live', 'polite');

    function go(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      slides.forEach((slide, k) => {
        const on = k === index;
        slide.setAttribute('aria-hidden', String(!on));
        slide.classList.toggle('is-active', on);
        if ('inert' in slide) slide.inert = !on;
      });
      dots.forEach((dot, k) => {
        if (k === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (currentEl) currentEl.textContent = String(index + 1);
    }

    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
    });

    let startX = null;
    let startY = null;
    viewport.addEventListener('pointerdown', (event) => {
      startX = event.clientX;
      startY = event.clientY;
    });
    viewport.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    });
    viewport.addEventListener('pointercancel', () => { startX = null; });

    go(0);
  }

  /* ------------------------------------------------------------------
     FAQ accordion
     ------------------------------------------------------------------ */

  function initAccordion() {
    const triggers = $$('.accordion__trigger');
    if (!triggers.length) return;

    const setState = (trigger, open) => {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(open));
      if (panel) panel.classList.toggle('is-open', open);
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        setState(trigger, trigger.getAttribute('aria-expanded') !== 'true');
      });
    });
  }

  /* ------------------------------------------------------------------
     Form validation helpers
     ------------------------------------------------------------------ */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const AU_PHONE_RE = /^(?:\+?61|0)[2-478]\d{8}$/;
  const normalisePhone = (value) => value.replace(/[\s().-]/g, '');

  function setFieldError(input, message) {
    const field = input.closest('.field');
    const error = $('[data-error-for="' + input.id + '"]');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      if (field) field.classList.add('has-error');
      if (error) error.textContent = message;
    } else {
      input.removeAttribute('aria-invalid');
      if (field) field.classList.remove('has-error');
      if (error) error.textContent = '';
    }
  }

  function attachLiveValidation(form, validators) {
    Object.keys(validators).forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      const check = () => setFieldError(input, validators[id](input.value.trim()));
      input.addEventListener('blur', () => {
        if (input.value.trim() || form.dataset.attempted === 'true') check();
      });
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') check();
      });
      input.addEventListener('change', () => {
        if (input.getAttribute('aria-invalid') === 'true') check();
      });
    });
  }

  function validateAll(validators) {
    let firstInvalid = null;
    Object.keys(validators).forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      const message = validators[id](input.value.trim());
      setFieldError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    });
    return firstInvalid;
  }

  /* ------------------------------------------------------------------
     Contact section 1: inquiry form and mailto builder
     ------------------------------------------------------------------ */

  function initInquiryForm() {
    const form = $('[data-inquiry-form]');
    if (!form) return;

    const status = $('[data-form-status]', form);
    const message = $('#f-message', form);
    const counter = $('[data-char-count]', form);
    const copyBrief = $('[data-copy-brief]', form);

    const validators = {
      'f-name': (v) => (v.length < 2 ? 'Enter your full name.' : ''),
      'f-email': (v) => {
        if (!v) return 'Enter your work email address.';
        return EMAIL_RE.test(v) ? '' : 'Enter an email address like name@company.com.au.';
      },
      'f-company': (v) => (v ? '' : 'Enter your company name.'),
      'f-phone': (v) => {
        if (!v) return '';
        return AU_PHONE_RE.test(normalisePhone(v)) ? '' : 'Enter an Australian number, such as 0412 345 678, or leave it blank.';
      },
      'f-service': (v) => (v ? '' : 'Choose the service you need.'),
      'f-message': (v) => {
        if (!v) return 'Tell us a little about your setup and goals.';
        return v.length < 20 ? 'Add a little more detail, at least 20 characters.' : '';
      }
    };

    attachLiveValidation(form, validators);

    if (message && counter) {
      const update = () => { counter.textContent = message.value.length.toLocaleString('en-AU'); };
      message.addEventListener('input', update);
      update();
    }

    const value = (id) => (document.getElementById(id).value || '').trim();

    function compose() {
      const subject = 'IT inquiry: ' + value('f-service') + ' for ' + value('f-company');
      const body = [
        'New IT inquiry from the Global Tech Infrastructure website',
        '',
        'Name: ' + value('f-name'),
        'Email: ' + value('f-email'),
        'Company: ' + value('f-company'),
        'Phone: ' + (value('f-phone') || 'Not provided'),
        'Service needed: ' + value('f-service'),
        '',
        'Message:',
        value('f-message'),
        '',
        'Sent from the email inquiry hub on the Global Tech Infrastructure website.'
      ].join('\n');
      return { subject: subject, body: body };
    }

    function check() {
      form.dataset.attempted = 'true';
      const firstInvalid = validateAll(validators);
      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.textContent = 'Some details need attention. Check the highlighted fields.';
          status.className = 'form-status is-error';
        }
        showToast('Check the highlighted fields, then try again.', 'error');
        return false;
      }
      return true;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!check()) return;
      const mail = compose();
      window.location.href = buildMailto(mail.subject, mail.body);
      if (status) {
        status.textContent = 'Your email app should now be open with the brief addressed to ' + CONTACT.email + '. Press send to deliver it. Nothing opened? Use Copy brief instead.';
        status.className = 'form-status is-success';
      }
      showToast('Email prepared for ' + CONTACT.email + '.');
    });

    if (copyBrief) {
      copyBrief.addEventListener('click', async () => {
        if (!check()) return;
        const mail = compose();
        const ok = await copyText('To: ' + CONTACT.email + '\nSubject: ' + mail.subject + '\n\n' + mail.body);
        if (ok) {
          if (status) {
            status.textContent = 'Brief copied. Paste it into a new email to ' + CONTACT.email + '.';
            status.className = 'form-status is-success';
          }
          showToast('Brief copied to your clipboard.');
        } else {
          showToast('Copying is blocked in this browser. Email ' + CONTACT.email + ' directly.', 'error');
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     Contact section 2: callback request and Perth coverage zones
     ------------------------------------------------------------------ */

  function initCallbackForm() {
    const form = $('[data-callback-form]');
    if (!form) return;
    const status = $('[data-callback-status]', form);

    const validators = {
      'cb-name': (v) => (v.length < 2 ? 'Enter your name.' : ''),
      'cb-phone': (v) => {
        if (!v) return 'Enter the number we should call.';
        return AU_PHONE_RE.test(normalisePhone(v)) ? '' : 'Enter an Australian number, such as 0412 345 678.';
      }
    };

    attachLiveValidation(form, validators);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.dataset.attempted = 'true';
      const firstInvalid = validateAll(validators);
      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.textContent = 'Check the highlighted fields, then try again.';
          status.className = 'form-status is-error';
        }
        return;
      }

      const name = $('#cb-name').value.trim();
      const phone = $('#cb-phone').value.trim();
      const time = $('#cb-time').value;
      const topic = $('#cb-topic').value;

      const subject = 'Callback request: ' + name + ' (' + time.toLowerCase() + ')';
      const body = [
        'Please call me back.',
        '',
        'Name: ' + name,
        'Phone: ' + phone,
        'Best time: ' + time,
        'Topic: ' + topic,
        'Requested at: ' + perthClockLabel() + ', Perth time',
        '',
        'Sent from the Perth phone dispatch hub on the Global Tech Infrastructure website.'
      ].join('\n');

      window.location.href = buildMailto(subject, body);
      if (status) {
        status.textContent = 'Your callback request is ready in your email app. Press send and we’ll call ' + phone + '.';
        status.className = 'form-status is-success';
      }
      showToast('Callback request prepared. Press send in your email app.');
    });
  }

  function initZones() {
    const card = $('[data-zones]');
    if (!card || !DATA) return;

    const buttons = $$('[data-zone]', card);
    const timeEl = $('[data-zone-time]', card);
    const areasEl = $('[data-zone-areas]', card);
    const noteEl = $('[data-zone-note]', card);

    const select = (zone) => {
      const info = DATA.zones[zone];
      if (!info) return;
      card.setAttribute('data-active', zone);
      buttons.forEach((b) => {
        const on = b.getAttribute('data-zone') === zone;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      timeEl.textContent = info.time;
      areasEl.textContent = info.areas;
      noteEl.textContent = info.note;
    };

    buttons.forEach((b) => b.addEventListener('click', () => select(b.getAttribute('data-zone'))));
    $$('[data-zone-ring]', card).forEach((ring) => {
      ring.addEventListener('click', () => select(ring.getAttribute('data-zone-ring')));
    });
  }

  /* ------------------------------------------------------------------
     Small utilities
     ------------------------------------------------------------------ */

  function initYear() {
    const year = String(new Date().getFullYear());
    $$('[data-year]').forEach((el) => { el.textContent = year; });
  }

  function initImageFallbacks() {
    $$('img:not([data-sd-image])').forEach(watchImage);
  }

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */

  const modules = [
    initHeader,
    initSectionSpy,
    initDrawer,
    initCopyButtons,
    initReveal,
    initCounters,
    initPerthClocks,
    initServiceFilter,
    initEstimator,
    initCarousel,
    initAccordion,
    initInquiryForm,
    initCallbackForm,
    initZones,
    initYear,
    initImageFallbacks
  ];

  modules.forEach((start) => {
    try {
      start();
    } catch (error) {
      if (window.console) console.error('[GTI] ' + start.name + ' failed to start', error);
    }
  });

  handleRoute();
  window.addEventListener('hashchange', handleRoute);
})();
