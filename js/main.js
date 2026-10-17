/* ==========================================================================
   Global Tech Infrastructure: interaction engine
   Vanilla ES6+. Depends on window.GTI from data.js.
   ========================================================================== */

(function () {
  'use strict';

  const D = window.GTI;
  if (!D) return;

  /* ---------- Utilities ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rand = (min, max) => min + Math.random() * (max - min);
  const randInt = (min, max) => Math.floor(rand(min, max + 1));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (n) => n.toLocaleString('en-AU');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const timeFmt = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Perth', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  const perthTime = () => timeFmt.format(new Date());

  /* Tracks which scopes are on screen. Off-screen scopes get .is-offscreen,
     which pauses CSS animation, and their SMIL animations are paused too. */
  const onScreen = new WeakMap();
  const scopeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const visible = entry.isIntersecting;
      onScreen.set(entry.target, visible);
      entry.target.classList.toggle('is-offscreen', !visible);
      $$('svg[data-smil]', entry.target).forEach((svg) => {
        if (typeof svg.pauseAnimations !== 'function') return;
        if (visible && !reduceMotion.matches) svg.unpauseAnimations();
        else svg.pauseAnimations();
      });
    });
  }, { rootMargin: '160px 0px' });
  $$('[data-scope]').forEach((el) => scopeObserver.observe(el));

  /* Runs fn on an interval, skipping ticks while the tab is hidden or the
     scope element is off screen. */
  function every(scope, ms, fn) {
    fn();
    return window.setInterval(() => {
      if (document.hidden) return;
      if (scope && onScreen.get(scope) === false) return;
      fn();
    }, ms);
  }

  const setText = (els, value) => els.forEach((el) => { el.textContent = value; });

  /* ---------- Toast ---------- */
  const toastEl = $('[data-toast]');
  const toastMsg = $('[data-toast-msg]');
  let toastTimer = 0;
  function toast(message) {
    if (!toastEl) return;
    toastMsg.textContent = message;
    toastEl.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  }

  /* ---------- Clocks ---------- */
  function initClocks() {
    const full = $$('[data-clock]');
    const short = $$('[data-clock-short]');
    const tick = () => {
      const t = perthTime();
      setText(full, t);
      setText(short, t.slice(0, 5));
    };
    tick();
    window.setInterval(tick, 1000);
    setText($$('[data-year]'), String(new Date().getFullYear()));
  }

  /* ---------- Header: scroll state, progress, mobile menu, scroll spy ---------- */
  function initHeader() {
    const nav = $('[data-nav]');
    const bar = $('[data-progress]');
    const toggle = $('.nav__toggle');
    const menu = $('#mnav');
    if (!nav) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();

    const setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
    };
    if (toggle && menu) {
      toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
      menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
      });
      window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
    }

    // Section id to nav link id. Sections without their own link clear the highlight.
    const spyMap = {
      hero: '', platform: 'platform', topology: 'topology', services: 'services', industries: 'industries',
      estimator: 'estimator', reports: '', faq: '', contact: 'contact', call: 'contact'
    };
    const links = $$('.nav__links a[data-spy]');
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = spyMap[entry.target.id];
        links.forEach((a) => a.classList.toggle('is-active', a.dataset.spy === id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => { if (s.id in spyMap) spy.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('.rv');
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 3D tilt ---------- */
  function initTilt() {
    if (!finePointer.matches || reduceMotion.matches) return;
    $$('[data-tilt]').forEach((stage) => {
      const target = $('[data-tilt-target]', stage) || stage.firstElementChild;
      const maxY = stage.classList.contains('stage') ? 9 : 5;
      const maxX = stage.classList.contains('stage') ? 7 : 4;
      let frame = 0;
      let last = null;
      stage.addEventListener('pointermove', (e) => {
        last = e;
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          const r = stage.getBoundingClientRect();
          const px = (last.clientX - r.left) / r.width - 0.5;
          const py = (last.clientY - r.top) / r.height - 0.5;
          target.style.setProperty('--ry', (px * maxY * 2).toFixed(2) + 'deg');
          target.style.setProperty('--rx', (-py * maxX * 2).toFixed(2) + 'deg');
        });
      });
      stage.addEventListener('pointerleave', () => {
        target.style.setProperty('--rx', '0deg');
        target.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Cursor spotlight on shells ---------- */
  function initSpotlight() {
    if (!finePointer.matches) return;
    $$('[data-spotlight]').forEach((group) => {
      const shells = $$('.shell', group);
      let frame = 0;
      let last = null;
      group.addEventListener('pointermove', (e) => {
        last = e;
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          shells.forEach((shell) => {
            const r = shell.getBoundingClientRect();
            shell.style.setProperty('--mx', (last.clientX - r.left).toFixed(0) + 'px');
            shell.style.setProperty('--my', (last.clientY - r.top).toFixed(0) + 'px');
          });
        });
      });
    });
  }

  /* ---------- Hero telemetry ---------- */
  function ecg(t) {
    const k = [[0, 0], [0.4, 0], [0.44, 3], [0.47, -17], [0.5, 12], [0.53, -4], [0.56, 0], [1, 0]];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) {
        const [t0, v0] = k[i - 1];
        const [t1, v1] = k[i];
        return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
      }
    }
    return 0;
  }

  function initHero() {
    const hero = $('#hero');

    // Oscilloscope: two identical periods so a 200 unit shift loops cleanly.
    const osc = $('[data-osc]');
    if (osc) {
      let d = '';
      for (let x = 0; x <= 400; x += 2) {
        const t = (x % 200) / 200;
        const y = 24 + ecg(t) + Math.sin(t * Math.PI * 2 * 5) * 2;
        d += (x === 0 ? 'M' : 'L') + x + ' ' + y.toFixed(2);
      }
      osc.setAttribute('d', d);
    }

    // Latency between 3.8 and 4.4 ms, shared with the marquee.
    const lat = $$('[data-latency]');
    every(hero, 1200, () => setText(lat, rand(3.8, 4.4).toFixed(1)));

    // Node counter drifts a little.
    const nodesEl = $$('[data-nodes]');
    let nodes = 1284;
    every(hero, 2600, () => {
      nodes = clamp(nodes + randInt(-2, 3), 1276, 1296);
      setText(nodesEl, fmt(nodes));
    });

    // Endpoint scan loop.
    const scanBar = $('[data-scan-bar]');
    const scanPct = $('[data-scan-pct]');
    const scanLabel = $('[data-scan-label]');
    let pct = 0;
    let hold = 0;
    every(hero, 420, () => {
      if (!scanBar) return;
      if (hold > 0) {
        hold -= 1;
        if (hold === 0) { pct = 0; scanLabel.textContent = 'SCANNING 1,284 ENDPOINTS'; }
      } else {
        pct = Math.min(100, pct + randInt(3, 9));
        if (pct === 100) { hold = 6; scanLabel.textContent = 'SCAN COMPLETE // 0 FINDINGS'; }
      }
      scanBar.style.width = pct + '%';
      scanPct.textContent = pct + '%';
    });
  }

  /* ---------- Marquee ---------- */
  function initMarquee() {
    $$('[data-marquee] .ticker__track').forEach((track) => {
      Array.from(track.children).forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    });
    const soc = $$('[data-soc-count]');
    let count = 18402;
    every($('.ticker'), 1800, () => {
      count += randInt(1, 4);
      setText(soc, fmt(count));
    });
  }

  /* ---------- Platform bento ---------- */
  const LOG_EVENTS = [
    ['EDR', 'BLOCKED', 'block', 'Encoded PowerShell on WS-OSB-114'],
    ['M365', 'CLEARED', 'ok', 'Impossible travel check, Subiaco'],
    ['FW', 'DROPPED', 'block', 'Port scan against Fremantle edge'],
    ['PATCH', 'APPLIED', 'warn', 'Cumulative update on 38 endpoints'],
    ['BACKUP', 'VERIFIED', 'ok', 'Immutable snapshot, West Perth'],
    ['MAIL', 'QUARANTINE', 'block', 'Credential phish sent to finance@'],
    ['IDP', 'ENFORCED', 'ok', 'MFA challenge on new device'],
    ['SDWAN', 'FAILOVER', 'warn', 'Karratha link moved to 5G in 0.6s'],
    ['EDR', 'ISOLATED', 'block', 'Suspicious DLL load, host isolated'],
    ['DNS', 'FILTERED', 'block', 'Newly registered domain blocked'],
    ['NET', 'HEALTHY', 'ok', 'Osborne Park core switch nominal'],
    ['CLOUD', 'SCALED', 'warn', 'AU East app tier scaled to 4 nodes']
  ];

  function initBento() {
    const log = $('[data-log]');
    const scope = $('#platform');
    if (log) {
      let i = randInt(0, LOG_EVENTS.length - 1);
      const add = (animate) => {
        const [src, status, kind, msg] = LOG_EVENTS[i % LOG_EVENTS.length];
        i += 1;
        const li = document.createElement('li');
        if (!animate) li.style.animation = 'none';
        li.innerHTML = '<time>' + perthTime() + '</time><span class="src">' + src + '</span>' +
          '<span class="st st--' + kind + '">' + status + '</span><span class="msg">' + msg + '</span>';
        log.appendChild(li);
        while (log.children.length > 8) log.removeChild(log.firstElementChild);
      };
      for (let n = 0; n < 6; n++) add(false);
      window.setInterval(() => {
        if (document.hidden || onScreen.get(scope) === false) return;
        add(true);
      }, 1900);
    }

    const bars = $('[data-bars]');
    if (bars) {
      const frag = document.createDocumentFragment();
      for (let n = 0; n < 90; n++) {
        const b = document.createElement('i');
        b.style.setProperty('--i', n);
        if (n === 31 || n === 67) b.className = 'is-maint';
        frag.appendChild(b);
      }
      bars.appendChild(frag);
    }

    initTicketTimer();
  }

  /* Shared ticket pickup timer (bento tile and service HUD). */
  function initTicketTimer() {
    const timers = $$('[data-ticket-timer]');
    const rings = $$('[data-ticket-ring]');
    const state = $('[data-ticket-state]');
    const ringBox = state ? state.closest('.ring') : null;
    if (!timers.length) return;
    let sec = 0;
    let target = randInt(31, 43);
    let hold = 0;
    window.setInterval(() => {
      if (document.hidden) return;
      if (hold > 0) {
        hold -= 1;
        if (hold === 0) {
          sec = 0;
          target = randInt(31, 43);
          if (state) state.textContent = 'RINGING';
          if (ringBox) ringBox.classList.remove('is-done');
        }
      } else {
        sec += 1;
        if (sec >= target) {
          hold = 14;
          if (state) state.textContent = 'PICKED UP';
          if (ringBox) ringBox.classList.add('is-done');
        }
      }
      setText(timers, '00:' + pad(sec));
      rings.forEach((r) => r.style.setProperty('--p', (sec / 45).toFixed(3)));
    }, 140);
  }

  /* ---------- Topology ---------- */
  function initTopology() {
    const canvas = $('[data-topo]');
    const panel = $('[data-topo-panel]');
    if (!canvas || !panel) return;

    const buttons = $$('.tnode', canvas);
    const traces = $$('[data-path]', canvas);
    const body = $('.tp', panel);
    const el = {
      code: $('[data-tp-code]', panel),
      status: $('[data-tp-status]', panel),
      icon: $('[data-tp-icon]', panel),
      layer: $('[data-tp-layer]', panel),
      name: $('[data-tp-name]', panel),
      desc: $('[data-tp-desc]', panel),
      metrics: $('[data-tp-metrics]', panel),
      sparkLabel: $('[data-tp-spark]', panel),
      line: $('[data-tp-line]', panel),
      area: $('[data-tp-area]', panel),
      cta: $('[data-tp-cta]', panel)
    };

    let series = [];
    const seed = () => { series = Array.from({ length: 30 }, () => rand(18, 52)); };
    const drawSpark = () => {
      const step = 240 / (series.length - 1);
      const pts = series.map((v, i) => (i * step).toFixed(1) + ',' + (64 - v).toFixed(1));
      el.line.setAttribute('points', pts.join(' '));
      el.area.setAttribute('d', 'M0 64L' + pts.join('L') + 'L240 64Z');
    };

    function select(id, focusPanel) {
      const node = D.nodes[id];
      if (!node) return;
      buttons.forEach((b) => {
        const on = b.dataset.node === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      traces.forEach((t) => t.classList.toggle('is-active', id === 'hub' || t.dataset.path === id));

      el.code.textContent = node.code;
      el.status.textContent = node.status;
      el.icon.setAttribute('href', '#' + node.icon);
      el.layer.textContent = node.layer;
      el.name.textContent = node.name;
      el.desc.textContent = node.desc;
      el.metrics.innerHTML = node.metrics.map((m) =>
        '<li><span>' + m[0] + '</span><b>' + m[1].replace('<', '&lt;') + '</b><i style="--p:' + m[2] + '%"></i></li>'
      ).join('');
      el.sparkLabel.textContent = node.spark;
      if (node.service === null) {
        el.cta.hidden = true;
      } else {
        el.cta.hidden = false;
        el.cta.dataset.openService = String(node.service);
      }

      body.classList.remove('is-swapping');
      void body.offsetWidth;
      body.classList.add('is-swapping');
      seed();
      drawSpark();
      if (focusPanel && window.matchMedia('(max-width: 1100px)').matches) {
        panel.closest('.topo__panel').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
      }
    }

    buttons.forEach((b, idx) => {
      b.addEventListener('click', () => select(b.dataset.node, true));
      b.addEventListener('keydown', (e) => {
        const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!dir) return;
        e.preventDefault();
        const next = buttons[(idx + dir + buttons.length) % buttons.length];
        next.focus();
        select(next.dataset.node, false);
      });
    });

    select('soc', false);
    every($('#topology'), 900, () => {
      series.shift();
      const last = series[series.length - 1];
      series.push(clamp(last + rand(-12, 12), 8, 58));
      drawSpark();
    });
  }

  /* ---------- Service HUD telemetry ---------- */
  function initServiceHuds() {
    const scope = $('#services');
    const allow = $$('[data-fw-allow]');
    const drop = $$('[data-fw-drop]');
    const tput = $$('[data-tput]');
    const rpo = $$('[data-rpo]');
    let a = 12408;
    let d = 317;
    let left = 15 * 60;
    every(scope, 1000, () => {
      a += randInt(6, 22);
      if (Math.random() < 0.45) d += randInt(1, 3);
      setText(allow, fmt(a));
      setText(drop, fmt(d));
      setText(tput, String(randInt(905, 968)));
      left = left <= 0 ? 15 * 60 : left - 1;
      setText(rpo, pad(Math.floor(left / 60)) + ':' + pad(left % 60));
    });
  }

  /* ---------- Service drawer ---------- */
  function initDrawer() {
    const drawer = $('#service-drawer');
    if (!drawer || typeof drawer.showModal !== 'function') return;

    const f = {
      code: $('[data-d-code]', drawer),
      img: $('[data-d-img]', drawer),
      num: $('[data-d-num]', drawer),
      kicker: $('[data-d-kicker]', drawer),
      title: $('[data-d-title]', drawer),
      intro: $('[data-d-intro]', drawer),
      sla: $('[data-d-sla]', drawer),
      list: $('[data-d-list]', drawer),
      ideal: $('[data-d-ideal]', drawer),
      brief: $('[data-d-brief]', drawer)
    };
    let current = 0;
    let opener = null;
    let closing = false;

    function open(index, trigger) {
      const s = D.services[index];
      if (!s) return;
      current = index;
      opener = trigger || document.activeElement;
      f.code.textContent = s.code + ' // ' + s.tag.toUpperCase();
      f.img.src = D.photo(s.image.id, 1200, 520);
      f.img.alt = s.image.alt;
      f.num.textContent = pad(index + 1);
      f.kicker.textContent = s.kicker;
      f.title.textContent = s.title;
      f.intro.textContent = s.intro;
      f.sla.innerHTML = s.sla.map((r) => '<div><dt>' + r[0] + '</dt><dd>' + r[1].replace('<', '&lt;') + '</dd></div>').join('');
      f.list.innerHTML = s.highlights.map((h, i) => '<li><span>' + pad(i + 1) + '</span>' + h + '</li>').join('');
      f.ideal.textContent = s.idealFor;
      drawer.classList.remove('is-closing');
      drawer.showModal();
      $('.drawer__in', drawer).scrollTop = 0;
      $('[data-drawer-close]', drawer).focus();
    }

    function close(after) {
      if (!drawer.open || closing) return;
      if (reduceMotion.matches) {
        drawer.close();
        if (after) after();
        return;
      }
      closing = true;
      drawer.classList.add('is-closing');
      window.setTimeout(() => {
        drawer.classList.remove('is-closing');
        drawer.close();
        closing = false;
        if (after) after();
      }, 330);
    }

    drawer.addEventListener('close', () => {
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    });
    drawer.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    drawer.addEventListener('click', (e) => { if (e.target === drawer) close(); });
    $('[data-drawer-close]', drawer).addEventListener('click', () => close());

    f.brief.addEventListener('click', () => {
      const tag = D.services[current].tag;
      opener = null;
      close(() => {
        const box = $$('[data-brief] input[name="svc"]').find((i) => i.value === tag);
        if (box && !box.checked) {
          box.checked = true;
          box.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const target = $('#contact');
        target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        window.setTimeout(() => { const n = $('#f-name'); if (n) n.focus({ preventScroll: true }); }, 700);
      });
    });

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-service], [data-open-service]');
      if (!trigger) return;
      const index = Number(trigger.dataset.service ?? trigger.dataset.openService);
      if (Number.isNaN(index)) return;
      e.preventDefault();
      open(index, trigger);
    });
  }

  /* ---------- Industry switcher ---------- */
  function initIndustries() {
    const root = $('[data-ind]');
    if (!root) return;
    const tablist = $('[role="tablist"]', root);
    const tabs = $$('[role="tab"]', root);
    const glider = $('.ind__glider', root);
    const panel = $('#ind-panel');
    const f = {
      code: $('[data-ind-code]', root),
      img: $('[data-ind-img]', root),
      statV: $('[data-ind-stat-v]', root),
      statL: $('[data-ind-stat-l]', root),
      title: $('[data-ind-title]', root),
      pitch: $('[data-ind-pitch]', root),
      stack: $('[data-ind-stack]', root),
      chips: $('[data-ind-chips]', root)
    };
    const levels = ['L5', 'L4', 'L3', 'L2', 'L1'];

    // Warm the cache so switching tabs feels instant.
    let preloaded = false;
    const preload = () => {
      if (preloaded) return;
      preloaded = true;
      Object.values(D.industries).forEach((ind) => { const im = new Image(); im.src = D.photo(ind.image.id, 800, 640); });
    };
    root.addEventListener('pointerenter', preload, { once: true });
    root.addEventListener('focusin', preload, { once: true });

    const moveGlider = (tab) => {
      if (!glider) return;
      tablist.classList.add('has-glider');
      glider.style.width = tab.offsetWidth + 'px';
      glider.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
    };

    function select(tab, focus) {
      const id = tab.dataset.indTab;
      const ind = D.industries[id];
      if (!ind) return;
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      panel.setAttribute('aria-labelledby', tab.id);
      moveGlider(tab);

      f.code.textContent = ind.code;
      f.statV.textContent = ind.stat[0];
      f.statL.textContent = ind.stat[1];
      f.title.textContent = ind.title;
      f.pitch.textContent = ind.pitch;
      f.stack.innerHTML = ind.stack.map((row, i) =>
        '<li style="--i:' + i + '"><span class="stack__k">' + levels[i] + ' // ' + row[0] + '</span><span class="stack__v">' + row[1] + '</span></li>'
      ).join('');
      f.chips.innerHTML = ind.chips.map((c) => '<li>' + c + '</li>').join('');

      [f.stack, f.chips].forEach((node, i) => {
        const cls = i === 0 ? 'is-swapping' : 'is-swapping-chips';
        node.classList.remove(cls);
        void node.offsetWidth;
        node.classList.add(cls);
      });

      const src = D.photo(ind.image.id, 800, 640);
      if (f.img.getAttribute('src') !== src) {
        f.img.classList.add('is-out');
        const next = new Image();
        next.onload = next.onerror = () => {
          window.setTimeout(() => {
            f.img.src = src;
            f.img.alt = ind.image.alt;
            f.img.classList.remove('is-out');
          }, reduceMotion.matches ? 0 : 220);
        };
        next.src = src;
      }
    }

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => select(tab, false));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
    });

    // Re-measure whenever a tab changes size (web fonts loading, breakpoints).
    const active = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    moveGlider(active());
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => moveGlider(active()));
      tabs.forEach((t) => ro.observe(t));
    } else {
      window.addEventListener('resize', () => moveGlider(active()), { passive: true });
    }
  }

  /* ---------- SLA estimator ---------- */
  function initEstimator() {
    const root = $('[data-estimator]');
    if (!root) return;
    const E = D.estimator;
    const seats = $('#est-seats');
    const cx = $('#est-cx');
    const toggles = $$('[data-tgl]', root);
    const out = (k) => $('[data-out-' + k + ']', root);
    const o = {
      seats: out('seats'), cx: out('cx'), tier: out('tier'), code: out('code'), dial: out('dial'),
      score: out('score'), p1: out('p1'), onsite: out('onsite'), uptime: out('uptime'),
      onboard: out('onboard'), modules: out('modules')
    };
    const cxLabel = $('[data-cx-label]', root);
    const covBars = $$('[data-cov]', root);
    const covVals = $$('[data-cov-v]', root);
    const DIAL = 289.03;
    let lastTier = '';
    let state = null;

    const fill = (input) => {
      const p = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--p', p + '%');
    };
    const isOn = (key) => $('[data-tgl="' + key + '"]', root).getAttribute('aria-checked') === 'true';

    function compute() {
      const n = Number(seats.value);
      const c = Number(cx.value);
      const on = { soc: isOn('soc'), net: isOn('net'), cloud: isOn('cloud'), dr: isOn('dr') };
      const seatPts = n < 20 ? 0 : n < 75 ? 1 : n < 150 ? 2 : 3;
      const pts = seatPts + (c - 1) * 0.6 + (on.soc ? 0.6 : 0) + (on.net ? 0.3 : 0) + (on.cloud ? 0.3 : 0) + (on.dr ? 0.3 : 0);
      const tierIdx = clamp(Math.floor(pts / 1.75), 0, 3);
      const tier = E.tiers[tierIdx];

      const cov = {
        support: clamp(58 + tierIdx * 12, 0, 100),
        security: clamp(30 + (on.soc ? 48 : 0) + tierIdx * 6, 0, 100),
        network: clamp(28 + (on.net ? 50 : 0) + (c - 1) * 5, 0, 100),
        cloud: clamp(22 + (on.cloud ? 56 : 0) + (c >= 3 ? 8 : 0), 0, 100),
        continuity: clamp(26 + (on.dr ? 58 : 0) + tierIdx * 4, 0, 100)
      };
      const score = Math.round(Object.values(cov).reduce((s, v) => s + v, 0) / 5);

      const modules = ['24/7 monitoring + Perth helpdesk'];
      if (on.soc) modules.push('24/7 SOC + EDR on every endpoint');
      if (on.net) modules.push('Network engineering: Wi-Fi 7, switching, firewalls');
      if (on.net && c >= 4) modules.push('SD-WAN mesh with 5G failover');
      if (on.cloud) modules.push('Managed Azure / AWS landing zone');
      if (on.dr) modules.push('Immutable backup in 2 AU locations');
      if (tierIdx >= 2) modules.push('Quarterly vCIO strategy reviews');
      if (c === 5) modules.push('Regional WA site kits with LEO satellite failover');

      const onboarding = E.onboarding.find((r) => n <= r.max).text;
      return { n, c, on, tier, tierIdx, cov, score, modules, onboarding };
    }

    function render() {
      state = compute();
      const s = state;
      const seatText = s.n >= 250 ? '250+ seats' : s.n + ' seats';
      const cxInfo = E.complexity[s.c - 1];
      fill(seats);
      fill(cx);
      seats.setAttribute('aria-valuetext', seatText);
      cx.setAttribute('aria-valuetext', 'Level ' + s.c + ', ' + cxInfo.label);
      o.seats.textContent = seatText;
      o.cx.textContent = 'Level ' + s.c;
      cxLabel.textContent = cxInfo.label;

      if (s.tier.name !== lastTier) {
        o.tier.textContent = s.tier.name;
        o.tier.classList.remove('is-flip');
        void o.tier.offsetWidth;
        o.tier.classList.add('is-flip');
        lastTier = s.tier.name;
      }
      o.code.textContent = s.tier.code + ' // ' + (s.n >= 250 ? '250+' : s.n) + ' SEATS // ' + cxInfo.short;
      o.p1.textContent = s.tier.p1 + ', 24/7';
      o.onsite.textContent = s.c === 5 ? s.tier.onsite + ' + regional fly-in' : s.tier.onsite;
      o.uptime.textContent = s.tier.uptime;
      o.onboard.textContent = s.onboarding;
      o.score.textContent = s.score;
      o.dial.style.strokeDashoffset = (DIAL * (1 - s.score / 100)).toFixed(2);

      covBars.forEach((b) => b.style.setProperty('--v', s.cov[b.dataset.cov] + '%'));
      covVals.forEach((v) => { v.textContent = s.cov[v.dataset.covV]; });

      const html = s.modules.map((m) => '<li>' + m + '</li>').join('');
      if (o.modules.innerHTML !== html) o.modules.innerHTML = html;
    }

    seats.addEventListener('input', render);
    cx.addEventListener('input', render);
    toggles.forEach((t) => t.addEventListener('click', () => {
      t.setAttribute('aria-checked', String(t.getAttribute('aria-checked') !== 'true'));
      render();
    }));
    render();

    $('[data-dispatch]').addEventListener('click', () => {
      const s = state;
      const layers = Object.entries({ '24/7 SOC': s.on.soc, 'Network Engineering': s.on.net, 'Managed Cloud': s.on.cloud, 'Immutable Backup & DR': s.on.dr })
        .filter((e) => e[1]).map((e) => e[0]);
      const body = [
        'Hi Global Tech Infrastructure team,',
        '',
        'Here is the blueprint from your SLA estimator:',
        '',
        'Recommended architecture: ' + s.tier.name + ' (' + s.tier.code + ')',
        'Team size: ' + (s.n >= 250 ? '250+' : s.n) + ' seats',
        'Complexity: Level ' + s.c + ', ' + E.complexity[s.c - 1].label,
        'Managed layers: ' + (layers.length ? layers.join(', ') : 'Helpdesk only'),
        'P1 response: ' + s.tier.p1 + ', 24/7',
        'Uptime target: ' + s.tier.uptime,
        'Onboarding: ' + s.onboarding,
        '',
        'Modules:',
        s.modules.map((m) => '  * ' + m).join('\n'),
        '',
        'Please send through a proposal.',
        ''
      ].join('\n');
      const url = 'mailto:' + D.contact.email + '?subject=' + encodeURIComponent('SLA blueprint: ' + s.tier.name + ', ' + (s.n >= 250 ? '250+' : s.n) + ' seats') + '&body=' + encodeURIComponent(body);
      window.location.href = url;
      toast('Blueprint ready. Opening your email app');
    });
  }

  /* ---------- Field reports slider ---------- */
  function initSlider() {
    const root = $('[data-slider]');
    if (!root) return;
    const track = $('[data-slider-track]', root);
    const slides = $$('.slide', root);
    const now = $('[data-slider-now]', root);
    const bar = $('[data-slider-bar]', root);
    const total = slides.length;
    const DUR = 7000;
    let index = 0;
    let timer = 0;
    let paused = false;
    let inView = false;

    $('[data-slider-total]', root).textContent = pad(total);
    root.style.setProperty('--dur', DUR + 'ms');

    function go(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      slides.forEach((s, n) => {
        const on = n === index;
        s.classList.toggle('is-current', on);
        s.setAttribute('aria-hidden', String(!on));
        if ('inert' in s) s.inert = !on;
      });
      now.textContent = pad(index + 1);
      restart();
    }

    function restart() {
      window.clearTimeout(timer);
      bar.classList.remove('is-running');
      if (reduceMotion.matches || paused || !inView) return;
      void bar.offsetWidth;
      bar.classList.add('is-running');
      timer = window.setTimeout(() => go(index + 1), DUR);
    }

    const pause = (p) => {
      paused = p;
      root.classList.toggle('is-paused', p);
      if (p) { window.clearTimeout(timer); bar.classList.remove('is-running'); } else restart();
    };

    $('[data-slider-prev]', root).addEventListener('click', () => go(index - 1));
    $('[data-slider-next]', root).addEventListener('click', () => go(index + 1));
    root.addEventListener('pointerenter', () => pause(true));
    root.addEventListener('pointerleave', () => pause(false));
    root.addEventListener('focusin', () => pause(true));
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) pause(false); });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    });

    let startX = null;
    track.addEventListener('pointerdown', (e) => { startX = e.clientX; });
    track.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    });
    track.addEventListener('pointercancel', () => { startX = null; });

    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      restart();
    }, { threshold: 0.35 }).observe(root);

    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); else pause(false); });

    go(0);
  }

  /* ---------- Accordion ---------- */
  function initAccordion() {
    $$('[data-acc] .acc__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        btn.closest('.acc__item').classList.toggle('is-open', open);
      });
    });
  }

  /* ---------- Clipboard ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  function initCopy() {
    $$('[data-copy]').forEach((btn) => {
      const label = $('span', btn);
      const original = label ? label.textContent : '';
      btn.addEventListener('click', async () => {
        const ok = await copyText(btn.dataset.copy);
        if (ok) {
          toast(btn.dataset.copy + ' copied to clipboard');
          btn.classList.add('is-copied');
          if (label) label.textContent = 'Copied';
          window.setTimeout(() => {
            btn.classList.remove('is-copied');
            if (label) label.textContent = original;
          }, 2200);
        } else {
          toast('Copy failed. Email ' + btn.dataset.copy);
        }
      });
    });
  }

  /* ---------- Forms ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    const field = input.closest('.field');
    const err = document.getElementById(input.getAttribute('aria-describedby'));
    if (field) field.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message || '';
  }

  function initBriefForm() {
    const form = $('[data-brief]');
    if (!form) return;
    const name = $('#f-name', form);
    const email = $('#f-email', form);
    const msg = $('#f-msg', form);
    const company = $('#f-company', form);
    const seatsSel = $('#f-seats', form);
    const status = $('[data-brief-status]', form);
    const steps = $$('[data-step]', form);

    const checks = {
      name: () => (name.value.trim().length >= 2 ? '' : 'Please add your name.'),
      email: () => (EMAIL_RE.test(email.value.trim()) ? '' : 'Please add a valid email address.'),
      msg: () => (msg.value.trim().length >= 10 ? '' : 'A sentence or two helps us prepare.')
    };
    const inputs = { name, email, msg };

    function updateSteps() {
      const picked = $$('input[name="svc"]:checked', form).length > 0;
      const details = !checks.name() && !checks.email() && !checks.msg();
      const done = [picked, details, false];
      const nowIdx = !picked ? 0 : !details ? 1 : 2;
      steps.forEach((s, i) => {
        s.classList.toggle('is-done', done[i]);
        s.classList.toggle('is-now', i === nowIdx);
      });
    }

    form.addEventListener('change', updateSteps);
    form.addEventListener('input', (e) => {
      updateSteps();
      const key = Object.keys(inputs).find((k) => inputs[k] === e.target);
      if (key && e.target.getAttribute('aria-invalid') === 'true') setError(e.target, checks[key]());
    });
    Object.keys(inputs).forEach((k) => {
      inputs[k].addEventListener('blur', () => { if (inputs[k].value.trim()) setError(inputs[k], checks[k]()); });
    });
    updateSteps();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let first = null;
      Object.keys(inputs).forEach((k) => {
        const m = checks[k]();
        setError(inputs[k], m);
        if (m && !first) first = inputs[k];
      });
      if (first) { first.focus(); return; }

      const services = $$('input[name="svc"]:checked', form).map((i) => i.value);
      const subject = 'Architecture brief: ' + (company.value.trim() || name.value.trim());
      const body = [
        'Name: ' + name.value.trim(),
        'Company: ' + (company.value.trim() || 'Not provided'),
        'Email: ' + email.value.trim(),
        'Team size: ' + (seatsSel.value || 'Not provided'),
        'Services: ' + (services.length ? services.join(', ') : 'General enquiry'),
        '',
        msg.value.trim(),
        ''
      ].join('\n');
      window.location.href = 'mailto:' + D.contact.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      steps.forEach((s) => { s.classList.add('is-done'); s.classList.remove('is-now'); });
      status.textContent = 'Your email app should now be open with the brief ready to send. If nothing opened, email ' + D.contact.email + ' directly.';
      toast('Brief ready. Opening your email app');
    });
  }

  function initCallback() {
    const form = $('[data-callback]');
    if (!form) return;
    const input = $('#cb-phone', form);
    const when = $('#cb-when', form);
    const err = $('[data-cb-err]', form);
    const valid = (v) => /^(\+?61|0)[2-478]\d{8}$/.test(v.replace(/[\s()-]/g, ''));

    const show = (m) => {
      err.textContent = m;
      form.classList.toggle('is-invalid', Boolean(m));
      input.setAttribute('aria-invalid', m ? 'true' : 'false');
    };
    input.addEventListener('input', () => { if (form.classList.contains('is-invalid') && valid(input.value)) show(''); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valid(input.value)) {
        show('Please enter an Australian number, for example 0412 345 678.');
        input.focus();
        return;
      }
      show('');
      const body = 'Please call me back on ' + input.value.trim() + '.\nPreferred time: ' + when.value + ' (AWST).\n';
      window.location.href = 'mailto:' + D.contact.email + '?subject=' + encodeURIComponent('Callback request: ' + input.value.trim()) + '&body=' + encodeURIComponent(body);
      toast('Callback request ready to send');
    });
  }

  /* ---------- Voice hub telemetry ---------- */
  function initVoice() {
    const pickup = $$('[data-pickup]');
    every($('#call'), 3000, () => setText(pickup, String(randInt(34, 41))));
  }

  /* ---------- Boot ---------- */
  function boot() {
    initClocks();
    initHeader();
    initReveal();
    initTilt();
    initSpotlight();
    initHero();
    initMarquee();
    initBento();
    initTopology();
    initServiceHuds();
    initDrawer();
    initIndustries();
    initEstimator();
    initSlider();
    initAccordion();
    initCopy();
    initBriefForm();
    initCallback();
    initVoice();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
