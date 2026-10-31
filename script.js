/* Bar Pelayo — maqueta v3. GSAP/ScrollTrigger/Lenis mejoran la experiencia; el contenido funciona sin ellos. */
(() => {
'use strict';
/* ===== CONFIGURACIÓN =====
   whatsapp: número en formato internacional SOLO con dígitos (ej. '34600000000').
   Déjalo vacío ('') mientras el bar no confirme un número: el botón de WhatsApp permanece oculto. */
const CONFIG = { whatsapp: '', email: 'info@pelayobar.com', defaultLang: 'es' };

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const I18N = window.I18N || { es: {} };
const LANGS = Object.keys(I18N);
let lang = CONFIG.defaultLang, data = null, active = 'ensaladas', wineFilter = 'Todos', lenis = null;
const t = k => (I18N[lang] && I18N[lang][k] != null ? I18N[lang][k] : (I18N.es[k] != null ? I18N.es[k] : k));
const plural = (n, key) => { const u = t(key); return n + ' ' + (Array.isArray(u) ? u[n === 1 ? 0 : 1] : u); };
const money = n => n == null ? '—' : Number(n).toFixed(2).replace('.', ',') + ' €';
const waNumber = String(CONFIG.whatsapp || '').replace(/\D/g, '');

/* ===== IDIOMA ===== */
function applyI18n() {
  document.documentElement.lang = lang;
  document.title = t('docTitle');
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => { const [a, k] = pair.split(':'); if (a && k) el.setAttribute(a.trim(), t(k.trim())); }));
  $$('.lang-select').forEach(s => { s.value = lang; s.setAttribute('aria-label', t('language')); });
  setHamburgerLabel();
  updateOpenStatus();
  if (data) { renderCategories(); renderDishes(); renderWines(); }
  if (window.PelayoMotion && typeof window.PelayoMotion.refreshText === 'function') window.PelayoMotion.refreshText();
}
function setLang(l, save = true) {
  lang = LANGS.includes(l) ? l : 'es';
  if (save) try { localStorage.setItem('pelayo-lang', lang); } catch (e) {}
  applyI18n();
}
$$('.lang-select').forEach(s => s.addEventListener('change', () => setLang(s.value)));

/* ===== CARTA ===== */
const unitFor = id => id === 'vinos' ? 'u_wine' : id === 'bebidas' ? 'u_drink' : 'u_dish';
async function init() {
  try {
    const r = await fetch('carta.json'); if (!r.ok) throw Error('carta.json ' + r.status);
    data = await r.json(); renderCategories(); renderDishes(); renderWines();
  } catch (e) { $('#dishes').textContent = t('loadError'); console.error(e); }
}
function renderCategories() {
  const box = $('#categories'); box.innerHTML = '';
  data.categories.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'tab-' + c.id; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'menu-panel');
    b.textContent = t('cat_' + c.id) || c.name; b.dataset.id = c.id;
    const on = c.id === active; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
    b.addEventListener('click', () => { active = c.id; renderCategories(); renderDishes(); $('#tab-' + c.id).focus({ preventScroll: true }); });
    box.append(b);
  });
  $('#menu-panel').setAttribute('aria-labelledby', 'tab-' + active);
  const cur = $('#tab-' + active); if (cur && box.scrollWidth > box.clientWidth) box.scrollLeft = cur.offsetLeft - 24;
}
$('#categories').addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault(); const ids = data.categories.map(c => c.id); let i = ids.indexOf(active);
  if (e.key === 'Home') i = 0; else if (e.key === 'End') i = ids.length - 1; else i = (i + (['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1) + ids.length) % ids.length;
  active = ids[i]; renderCategories(); renderDishes(); $('#tab-' + active).focus();
});
function renderDishes() {
  let list = data.dishes.filter(d => d.category === active);
  if ($('#vegetarian').checked) list = list.filter(d => d.vegetarian === true);
  const cat = data.categories.find(c => c.id === active);
  $('#category-title').textContent = t('cat_' + active) || cat.name;
  $('#menu-eyebrow').textContent = t('eye_' + active) || cat.eyebrow;
  $('#count').textContent = plural(list.length, unitFor(active));
  const box = $('#dishes'); box.innerHTML = '';
  if (!list.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = t('empty'); box.append(p); return; }
  list.forEach(d => {
    const row = document.createElement('article'); row.className = 'dish';
    const name = document.createElement('div'); name.className = 'dish-name';
    const h = document.createElement('h4'); h.textContent = d.name; name.append(h);
    const desc = d.desc && d.desc[lang];
    if (desc) { const p = document.createElement('p'); p.className = 'dish-desc'; p.textContent = desc; if (lang !== 'es') p.lang = lang; name.append(p); }
    if (d.vegetarian) { const m = document.createElement('small'); m.className = 'veg'; m.textContent = t('veg_tag'); name.append(m); }
    const prices = document.createElement('div'); prices.className = 'prices';
    ['tapa', 'media', 'plato'].forEach(key => {
      const s = document.createElement('span'); if (d.prices[key] == null) s.className = 'na';
      const sm = document.createElement('small'); const custom = d.priceLabels && d.priceLabels[key];
      sm.textContent = custom ? (I18N.es['lbl_' + custom] ? t('lbl_' + custom) : custom) : t('col_' + key);
      const b = document.createElement('b'); b.textContent = money(d.prices[key]);
      if (d.prices[key] == null) b.setAttribute('aria-label', '—');
      s.append(sm, b); prices.append(s);
    });
    row.append(name, prices); box.append(row);
  });
}
$('#vegetarian').addEventListener('change', () => data && renderDishes());
$('#allergens').addEventListener('change', e => { $('#allergen-panel').hidden = !e.target.checked; });

/* ===== VINOS ===== */
function renderWines() {
  const grid = $('#wine-grid'); grid.innerHTML = '';
  const list = data.wines.filter(w => wineFilter === 'Todos' || w.type === wineFilter);
  $('#wine-count').textContent = '· ' + plural(list.length, 'u_ref');
  list.forEach(w => {
    const item = document.createElement('article'); item.className = 'wine-item';
    const left = document.createElement('div'); const h = document.createElement('h4'); h.textContent = w.name;
    const p = document.createElement('p'); p.textContent = w.region + ' · ' + (/no especificada/i.test(w.grape) ? t('grape_na') : w.grape);
    left.append(h, p);
    const b = document.createElement('b'); b.textContent = [w.glass && t('glass') + ' ' + w.glass, w.bottle && t('bottle') + ' ' + w.bottle].filter(Boolean).join(' · ') || t('ask');
    item.append(left, b); grid.append(item);
  });
}
$$('#wine-filters button').forEach(b => b.addEventListener('click', () => {
  wineFilter = b.dataset.filter;
  $$('#wine-filters button').forEach(x => { const on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
  if (data) renderWines();
}));

/* ===== RESERVA ===== */
const form = $('#reservation-form');
const today = new Date(); form.elements.date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const isGroup = () => form.elements.type.value === 'grupo' || Number(form.elements.people.value) >= 10;
const syncGroupHint = () => { $('#group-hint').hidden = !isGroup(); };
form.addEventListener('input', syncGroupHint); form.addEventListener('change', syncGroupHint);
$$('[data-reserve="group"]').forEach(a => a.addEventListener('click', () => {
  form.elements.type.value = 'grupo';
  if (Number(form.elements.people.value) < 10) form.elements.people.value = 10;
  if (!form.elements.notes.value.trim()) form.elements.notes.value = t('group_note_prefill') + ' ';
  syncGroupHint();
  setTimeout(() => form.elements.name.focus({ preventScroll: true }), reduced ? 0 : 900);
}));
function buildRequest() {
  const d = new FormData(form); const group = isGroup();
  const subject = `${group ? 'Solicitud de reserva de GRUPO' : 'Solicitud de reserva'} — ${d.get('name')} — ${d.get('date')} ${d.get('time')} — ${d.get('people')} pers.`;
  const body = ['Hola, Bar Pelayo:', '', 'Quisiera solicitar una reserva:',
    'Tipo: ' + (group ? 'Grupo (salón grande)' : 'Mesa'), 'Nombre: ' + d.get('name'), 'Teléfono: ' + d.get('phone'),
    'Fecha: ' + d.get('date'), 'Hora: ' + d.get('time'), 'Personas: ' + d.get('people'), 'Email: ' + (d.get('email') || 'No indicado'),
    'Observaciones: ' + ((d.get('notes') || '').trim() || 'Ninguna'), 'Idioma del cliente: ' + lang.toUpperCase(), '',
    'Entiendo que la reserva queda pendiente de confirmación por parte del bar.'].join('\n');
  return { subject, body };
}
function valid() { const ok = form.checkValidity(); form.classList.toggle('was-validated', !ok); if (!ok) { form.reportValidity(); $('#feedback').textContent = t('fb_invalid'); } return ok; }
form.addEventListener('submit', e => {
  e.preventDefault(); if (!valid()) return;
  const { subject, body } = buildRequest();
  $('#feedback').textContent = t('fb_mail');
  location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
});
if (waNumber) {
  const wa = $('#wa-submit'); wa.hidden = false;
  wa.addEventListener('click', () => { if (!valid()) return; const { subject, body } = buildRequest(); $('#feedback').textContent = t('fb_wa'); window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(subject + '\n\n' + body), '_blank', 'noopener'); });
  const wv = $('#wa-visit'); wv.hidden = false; wv.href = 'https://wa.me/' + waNumber;
}

/* ===== MENÚ MÓVIL ===== */
const hamb = $('.hamb'), mobile = $('#mobile-nav'), header = $('#top-header');
function setHamburgerLabel() { hamb.setAttribute('aria-label', t(mobile.classList.contains('is-open') ? 'menuClose' : 'menuOpen')); }
function setMenu(open) {
  mobile.classList.toggle('is-open', open); mobile.setAttribute('aria-hidden', String(!open));
  if ('inert' in mobile) mobile.inert = !open;
  hamb.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open); setHamburgerLabel();
  if (lenis) open ? lenis.stop() : lenis.start();
  if (open) { const f = $('a', mobile); f && f.focus({ preventScroll: true }); }
}
if ('inert' in mobile) mobile.inert = true;
hamb.addEventListener('click', () => setMenu(!mobile.classList.contains('is-open')));
$$('#mobile-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && mobile.classList.contains('is-open')) { setMenu(false); hamb.focus(); } });
const desktopQuery = matchMedia('(min-width: 901px)');
if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', m => { if (m.matches) setMenu(false); });
else if (desktopQuery.addListener) desktopQuery.addListener(m => { if (m.matches) setMenu(false); });
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ===== HORARIO ===== */
function updateOpenStatus() {
  try {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const h = +p.find(x => x.type === 'hour').value; const open = h >= 12 && h < 24;
    $('#open-status').textContent = t(open ? 'open_now' : 'closed_now'); $('.open').classList.toggle('closed', !open);
  } catch (e) {}
}

/* ===== GALERÍA: arrastre con inercia + lightbox con zoom ===== */
const track = $('#gallery-track'), items = track ? $$('.g-item', track) : [];
let drag = null, moved = false, inertiaTween = null;
if (track) {
  track.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (inertiaTween) inertiaTween.kill();
    drag = { x: e.clientX, startScroll: track.scrollLeft, lastScroll: track.scrollLeft, lastTime: performance.now(), velocity: 0 };
    moved = false;
    track.classList.add('dragging');
    try { track.setPointerCapture(e.pointerId); } catch (err) {}
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 5) moved = true;
    track.scrollLeft = drag.startScroll - dx;
    const now = performance.now(), dt = Math.max(1, now - drag.lastTime);
    drag.velocity = (track.scrollLeft - drag.lastScroll) / dt;
    drag.lastScroll = track.scrollLeft;
    drag.lastTime = now;
  }, { passive: true });
  const finishDrag = () => {
    if (!drag) return;
    const velocity = drag.velocity;
    drag = null;
    track.classList.remove('dragging');
    if (moved && !reduced && Math.abs(velocity) > .08) {
      const start = track.scrollLeft;
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const target = Math.max(0, Math.min(max, start + velocity * 480));
      if (window.gsap) {
        const proxy = { x: start };
        inertiaTween = gsap.to(proxy, {
          x: target, duration: .85, ease: 'power3.out',
          onUpdate: () => { track.scrollLeft = proxy.x; }
        });
      } else {
        track.scrollBy({ left: target - start, behavior: 'smooth' });
      }
    }
  };
  window.addEventListener('pointerup', finishDrag);
  window.addEventListener('pointercancel', finishDrag);
  track.addEventListener('click', e => {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
  }, true);
}
const step = dir => {
  const w = items[0] ? items[0].getBoundingClientRect().width + 16 : 300;
  if (track) track.scrollBy({ left: dir * w, behavior: reduced ? 'auto' : 'smooth' });
};
$('#g-prev').addEventListener('click', () => step(-1));
$('#g-next').addEventListener('click', () => step(1));
track && track.addEventListener('keydown', e => {
  if (e.target === track && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1);
  }
});
const lb = $('#lightbox'), lbImg = $('#lb-img'); let lbIndex = 0;
function showLb(i) {
  lbIndex = (i + items.length) % items.length;
  const img = $('img', items[lbIndex]);
  lbImg.src = items[lbIndex].dataset.full;
  lbImg.loading = 'eager';
  lbImg.alt = img.alt;
  $('#lb-cap').textContent = img.alt;
  lbImg.classList.remove('zoomed');
  lbImg.style.transformOrigin = 'center center';
  if (lbImg.decode) lbImg.decode().catch(() => {});
}
items.forEach((it, i) => it.addEventListener('click', () => {
  showLb(i);
  if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
  if (lenis) lenis.stop();
}));
const closeLb = () => { if (lb.close) lb.close(); else lb.removeAttribute('open'); };
lb.addEventListener('close', () => {
  if (lenis) lenis.start();
  items[lbIndex] && items[lbIndex].focus({ preventScroll: true });
});
$('#lb-close').addEventListener('click', closeLb);
$('#lb-prev').addEventListener('click', () => showLb(lbIndex - 1));
$('#lb-next').addEventListener('click', () => showLb(lbIndex + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
lb.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
});
lbImg.addEventListener('click', e => {
  const r = lbImg.getBoundingClientRect();
  lbImg.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
  lbImg.classList.toggle('zoomed');
});
lbImg.addEventListener('mousemove', e => {
  if (!lbImg.classList.contains('zoomed')) return;
  const r = lbImg.getBoundingClientRect();
  lbImg.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
});

/* ===== SISTEMA CINEMATOGRÁFICO =====
   GSAP/ScrollTrigger/Lenis son mejoras progresivas: sin CDN, la página conserva todo el contenido
   y el scroll nativo. En móvil se simplifican los efectos y se desactivan los pins pesados. */
const motionReady = !reduced && !!(window.gsap && window.ScrollTrigger);
let heroIntroTween = null, heroWordsTween = null, manifestoWordsTween = null;

function killTween(tween) {
  if (!tween) return;
  if (tween.scrollTrigger) tween.scrollTrigger.kill();
  tween.kill();
}
function splitTextNodes(el, withCharacters = false) {
  if (!el) return [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const parts = node.nodeValue.split(/(\s+)/);
    const fragment = document.createDocumentFragment();
    parts.forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'word';
      if (withCharacters) {
        [...part].forEach(char => {
          const letter = document.createElement('span');
          letter.className = 'char';
          letter.textContent = char;
          word.append(letter);
        });
      } else {
        word.textContent = part;
      }
      fragment.append(word);
    });
    node.replaceWith(fragment);
  });
  return [...el.querySelectorAll('.word')];
}
function refreshSplitText() {
  if (!motionReady) return;
  const heroTitle = $('.hero-title');
  const manifestoTitle = $('.manifesto .word-reveal');
  killTween(heroIntroTween); killTween(heroWordsTween); killTween(manifestoWordsTween);
  if (heroTitle) {
    splitTextNodes(heroTitle, true);
    heroIntroTween = gsap.from(heroTitle.querySelectorAll('.char'), {
      yPercent: 115, opacity: 0, rotateX: -18, duration: 1.15,
      stagger: .018, ease: 'power4.out', delay: .18,
      onComplete: () => { heroTitle.querySelectorAll('.char').forEach(c => { c.style.willChange = 'auto'; }); }
    });
    heroTitle.querySelectorAll('.char').forEach(c => { c.style.willChange = 'transform, opacity'; });
    const heroWords = heroTitle.querySelectorAll('.word');
    heroWordsTween = gsap.fromTo(heroWords, { opacity: .28, y: 16 }, {
      opacity: 1, y: 0, ease: 'none', stagger: .08,
      scrollTrigger: { trigger: heroTitle, start: 'top top+=70', end: 'bottom top', scrub: .8 }
    });
  }
  if (manifestoTitle) {
    splitTextNodes(manifestoTitle, false);
    manifestoWordsTween = gsap.fromTo(manifestoTitle.querySelectorAll('.word'), {
      opacity: .2, y: 18
    }, {
      opacity: 1, y: 0, ease: 'none', stagger: .12,
      scrollTrigger: { trigger: manifestoTitle, start: 'top 82%', end: 'bottom 52%', scrub: .8 }
    });
  }
  ScrollTrigger.refresh();
}
window.PelayoMotion = { refreshText: refreshSplitText };

if (motionReady) {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('cinematic-ready');

  /* Lenis solo cuando está disponible y el usuario no ha pedido movimiento reducido. */
  if (window.Lenis) {
    try {
      lenis = new Lenis({ duration: 1.12, smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.05 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        const target = id.length > 1 && $(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -(header.offsetHeight - 1), duration: 1.15 });
        }
      }));
    } catch (e) { lenis = null; }
  }

  /* Hero: Ken Burns, título por letras y salida cinematográfica al avanzar. */
  const hero = $('.hero'), heroImg = $('.hero-bg img');
  if (hero && heroImg) {
    gsap.fromTo(heroImg, { scale: 1.02 }, { scale: 1.09, duration: 14, ease: 'none' });
    gsap.to(heroImg, {
      scale: 1.18, yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
    });
    gsap.to('.hero-copy', {
      y: -105, opacity: .12, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
    });
    gsap.to('.hero-bg', {
      yPercent: 10, opacity: .55, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
    });
  }

  /* Historia: dos capítulos que se cruzan mientras el escenario permanece fijo. */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const storyRun = $('#history-story');
    const chapters = $$('.story-chapter');
    const photos = $$('.story-photo');
    if (storyRun && chapters.length > 1 && photos.length > 1) {
      gsap.set([chapters[1], photos[1]], { opacity: 0, y: 28 });
      const storyTL = gsap.timeline({
        scrollTrigger: {
          trigger: storyRun, start: 'top top+=76', end: 'bottom bottom',
          scrub: 1, onUpdate: self => {
            const second = self.progress >= .5;
            $('#story-current').textContent = second ? '02' : '01';
            chapters.forEach((el, i) => el.classList.toggle('is-active', i === (second ? 1 : 0)));
            photos.forEach((el, i) => { el.classList.toggle('is-active', i === (second ? 1 : 0)); el.setAttribute('aria-hidden', String(i !== (second ? 1 : 0))); });
            chapters.forEach((el, i) => el.setAttribute('aria-hidden', String(i !== (second ? 1 : 0))));
          }
        }
      });
      storyTL.to(chapters[0], { opacity: 0, y: -28, duration: .45, ease: 'none' }, .42)
        .to(chapters[1], { opacity: 1, y: 0, duration: .48, ease: 'none' }, .5)
        .to(photos[0], { opacity: 0, scale: 1.08, duration: .48, ease: 'none' }, .42)
        .to(photos[1], { opacity: 1, scale: 1, duration: .48, ease: 'none' }, .5);
    }

    /* Espacios: el scroll vertical desplaza el recorrido horizontal. */
    const viewport = $('#spaces-viewport'), spaceTrack = $('#space-track');
    if (viewport && spaceTrack) {
      const travel = () => Math.max(0, spaceTrack.scrollWidth - viewport.clientWidth);
      gsap.to(spaceTrack, {
        x: () => -travel(), ease: 'none',
        scrollTrigger: {
          trigger: viewport, start: 'top top+=90', end: () => '+=' + travel(),
          pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            const current = Math.min(3, Math.floor(self.progress * 3) + 1);
            $('#space-current').textContent = String(current).padStart(2, '0');
          }
        }
      });
    }
  });

  /* Móvil/tablet: entradas ligeras, sin pin horizontal ni escena pegajosa. */
  mm.add('(max-width: 900px)', () => {
    gsap.utils.toArray('.eyebrow,.copy p,.space-card,.garden,.groups-copy>p,.group-facts li,.visit-grid>div>*').forEach(el => {
      gsap.from(el, {
        y: 18, opacity: 0, duration: .72, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      });
    });
  });

  /* Profundidad sutil en imágenes y revelado de escenas con máscara + wipe + tono. */
  gsap.utils.toArray('.history-photos .image img,.story-photo img,.space-card .image img,.wine-banner img,.groups-image img,.manifesto-bg img').forEach(img => {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });
  gsap.utils.toArray('.scene-section:not(.intro):not(.spaces)').forEach(section => {
    const wipe = document.createElement('span');
    wipe.className = 'scene-wipe';
    wipe.setAttribute('aria-hidden', 'true');
    section.prepend(wipe);
    const targetBg = getComputedStyle(section).backgroundColor;
    gsap.fromTo(section, { clipPath: 'inset(5% 0 0% 0 round 20px)', backgroundColor: '#211714' }, {
      clipPath: 'inset(0% 0 0% 0 round 0px)', backgroundColor: targetBg,
      ease: 'none', immediateRender: false,
      scrollTrigger: { trigger: section, start: 'top 94%', end: 'top 55%', scrub: .7 }
    });
    gsap.fromTo(wipe, { scaleX: 0, opacity: .95 }, {
      scaleX: 1, opacity: 0, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 92%', end: 'top 68%', scrub: .6 }
    });
  });

  /* Contador de valoración: conserva exactamente el dato 8,8/10. */
  const ratingNumber = $('.rating-number');
  if (ratingNumber) {
    const value = Number(ratingNumber.dataset.count || 0), counter = { value: 0 };
    gsap.to(counter, {
      value, duration: 1.3, ease: 'power2.out',
      scrollTrigger: { trigger: ratingNumber, start: 'top 90%', once: true },
      onUpdate: () => { ratingNumber.textContent = counter.value.toFixed(1).replace('.', ','); }
    });
  }

  /* Barra de lectura y refresh tras cargar imágenes (sus cajas ya tienen tamaño reservado). */
  gsap.to('#progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: .35 }
  });
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  refreshSplitText();
} else {
  document.documentElement.classList.add('no-motion');
}

/* Cursor personalizado únicamente con puntero fino, escritorio y movimiento permitido. */
if (!reduced && matchMedia('(pointer:fine)').matches && innerWidth > 900) {
  const c = $('.cursor');
  if (c) {
    window.addEventListener('mousemove', e => {
      c.style.left = e.clientX + 'px';
      c.style.top = e.clientY + 'px';
    }, { passive: true });
    $$('.g-item,.space-card .image').forEach(el => {
      el.addEventListener('mouseenter', () => { c.style.opacity = 1; });
      el.addEventListener('mouseleave', () => { c.style.opacity = 0; });
    });
  }
}

/* ===== ARRANQUE ===== */
let initial = CONFIG.defaultLang;
try { const q = new URLSearchParams(location.search).get('lang'); const s = localStorage.getItem('pelayo-lang'); initial = (q && LANGS.includes(q)) ? q : (s && LANGS.includes(s) ? s : initial); } catch (e) {}
setLang(initial, false);
init();
})();
