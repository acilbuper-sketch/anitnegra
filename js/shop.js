/* Tienda de Anitnegra Acilbuper: ficha de obra, carrito y pedido.
   Requiere js/config.js (SHOP) y js/books.js (BOOKS). Lo comparten index.html y atlas.html. */
const Shop = (() => {
  const KEY = 'anitnegra_cart_v1';
  const FMT = Object.keys(SHOP.formats);
  const GRAD = {
    'Biblioteca Gnóstica': ['#17140f', '#4b3a20'],
    'Trilogía Mineral': ['#1c2628', '#5d6e6a'],
    'Narrativa histórica': ['#2c1415', '#741f22'],
    'Narrativa contemporánea': ['#232d23', '#8a7a4a'],
    'Ensayo y pensamiento': ['#26221f', '#665746']
  };

  /* ---------- utilidades ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const money = n => new Intl.NumberFormat(SHOP.locale, { style: 'currency', currency: SHOP.currency, maximumFractionDigits: 0 }).format(n);
  const byId = id => BOOKS.find(b => b.id === id);
  const $ = (s, r = document) => r.querySelector(s);

  /* ---------- formatos y precios ---------- */
  function status(b, k) {
    if (b.draft) return 'soon';
    const over = b.formats && b.formats[k];
    if (over) return over;
    if (k === 'navegable' && !b.readLink) return 'none';
    return SHOP.defaultStatus[k];
  }
  const price = (b, k) => (b.prices && b.prices[k] != null) ? b.prices[k] : SHOP.formats[k].price;
  const buyable = b => FMT.filter(k => status(b, k) === 'available');
  function fromPrice(b) { const a = buyable(b); return a.length ? Math.min(...a.map(k => price(b, k))) : null; }
  function chips(b) {
    return FMT.filter(k => status(b, k) !== 'none').map(k =>
      `<span class="fchip ${status(b, k) === 'available' ? 'on' : 'soon'}" title="${esc(SHOP.formats[k].label)}${status(b, k) === 'soon' ? ' · próximamente' : ''}">${esc(SHOP.formats[k].short)}</span>`).join('');
  }

  /* ---------- portadas ---------- */
  function typo(b) {
    const g = GRAD[b.collection] || GRAD['Ensayo y pensamiento'];
    return `<div class="tcover" style="background:linear-gradient(150deg,${g[0]},${g[1]})"><div class="tc-meta">${esc(b.type)} · ${esc(b.collection)}</div><div class="tc-title">${esc(b.short || b.title)}</div><div class="tc-author">${esc(b.author === 'Por confirmar' ? '' : b.author)}</div></div>`;
  }
  function cover(b) {
    if (b.cover && /^(assets\/|https?:)/.test(b.cover))
      return `<img src="${esc(b.cover)}" alt="Portada de ${esc(b.title)}" loading="lazy" data-cover-id="${esc(b.id)}" onerror="Shop.coverFallback(this)">`;
    return typo(b);
  }
  function coverFallback(img) {
    const b = byId(img.dataset.coverId); if (!b) return;
    img.parentElement.innerHTML = typo(b);
  }

  /* ---------- carrito ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(i => byId(i.id) && SHOP.formats[i.fmt]); } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* sin storage: queda en memoria */ } };
  const count = () => cart.reduce((n, i) => n + i.qty, 0);
  const total = () => cart.reduce((n, i) => n + price(byId(i.id), i.fmt) * i.qty, 0);

  function add(id, fmt) {
    const b = byId(id);
    if (!b || status(b, fmt) !== 'available') return false;
    const found = cart.find(i => i.id === id && i.fmt === fmt);
    if (found) { if (fmt === 'fisico') found.qty++; else { toast('Ya tenés «' + b.short + '» (' + SHOP.formats[fmt].short + ') en el carrito.'); return false; } }
    else cart.push({ id, fmt, qty: 1 });
    save(); refresh();
    toast('Agregado: ' + b.short + ' · ' + SHOP.formats[fmt].short);
    return true;
  }
  function remove(id, fmt) { cart = cart.filter(i => !(i.id === id && i.fmt === fmt)); save(); refresh(); }
  function setQty(id, fmt, d) {
    const i = cart.find(x => x.id === id && x.fmt === fmt); if (!i) return;
    i.qty = Math.max(1, Math.min(20, i.qty + d)); save(); refresh();
  }

  /* ---------- toast ---------- */
  let tt;
  function toast(msg, ms = 3200) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), ms);
  }

  /* ---------- envío de formularios (Netlify Forms) ---------- */
  function post(data) {
    return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }

  /* ---------- UI: modal de obra ---------- */
  let modal, drawer, lastFocus;
  function build() {
    modal = document.createElement('div');
    modal.className = 'bm'; modal.id = 'bookModal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'bmTitle');
    modal.innerHTML = '<div class="bm-box"><button class="bm-close" data-close aria-label="Cerrar">×</button><div class="bm-cover" id="bmCover"></div><div class="bm-body" id="bmBody"></div></div>';
    drawer = document.createElement('div');
    drawer.className = 'cd'; drawer.id = 'cartDrawer'; drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-modal', 'true'); drawer.setAttribute('aria-label', 'Carrito de compra');
    drawer.innerHTML = '<aside class="cd-panel"><div class="cd-head"><h2>Tu carrito</h2><button class="cd-x" data-close aria-label="Cerrar carrito">×</button></div><div class="cd-main" id="cdMain"></div></aside>';
    document.body.append(modal, drawer);

    [modal, drawer].forEach(el => el.addEventListener('click', e => {
      if (e.target === el || e.target.closest('[data-close]')) closeAll();
    }));
    modal.addEventListener('click', onModalClick); modal.addEventListener('submit', onModalSubmit);
    drawer.addEventListener('click', onDrawerClick); drawer.addEventListener('submit', onCheckout);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

    // Delegación global: [data-open=id] abre ficha, [data-add=id] agrega ebook, #cartBtn abre carrito
    document.addEventListener('click', e => {
      const add_ = e.target.closest('[data-add]');
      if (add_) { e.stopPropagation(); const id = add_.dataset.add; const b = byId(id); const f = add_.dataset.fmt || (b && buyable(b)[0]); if (f && add(id, f)) { /* ok */ } else if (b && !buyable(b).length) openBook(id); return; }
      const op = e.target.closest('[data-open]');
      if (op) { e.preventDefault(); openBook(op.dataset.open); return; }
      if (e.target.closest('#cartBtn')) openCart();
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const op = e.target.closest && e.target.closest('[data-open]');
      if (op && op === e.target) openBook(op.dataset.open);
    });
  }

  function lock(on) { document.body.classList.toggle('lock', on); }
  function closeAll() {
    modal.classList.remove('open'); drawer.classList.remove('open'); lock(false);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* nada */ } lastFocus = null; }
  }

  function openBook(id) {
    const b = byId(id); if (!b) return;
    lastFocus = document.activeElement;
    $('#bmCover').innerHTML = cover(b);
    const meta = [b.author !== 'Por confirmar' ? b.author : null, b.type, b.collection, b.year].filter(Boolean).join(' · ');
    const rows = FMT.map(k => {
      const st = status(b, k), f = SHOP.formats[k];
      if (st === 'none') return '';
      const action = st === 'available'
        ? `<button class="bm-add" data-add="${esc(b.id)}" data-fmt="${k}">Agregar</button>`
        : `<button class="bm-notify" data-notify="${k}">Avisarme</button>`;
      return `<li class="fmt-row is-${st}">
        <div><b>${esc(f.label)}</b><span>${esc(f.detail)}</span></div>
        <div class="fmt-buy"><em>${st === 'available' ? money(price(b, k)) : 'Próximamente'}</em>${action}</div>
        ${st === 'soon' ? `<form class="notify" data-notify-form="${k}" hidden><input type="email" required placeholder="Tu correo" aria-label="Correo para avisarte"><button class="btn gold" type="submit">Enviar</button></form>` : ''}
      </li>`;
    }).join('');
    const links = [];
    if (b.readLink) links.push(`<a href="${esc(b.readLink)}" target="_blank" rel="noopener">${b.draft ? 'Ver edición web' : 'Lectura digital'} ↗</a>`);
    if (b.amazonLink) links.push(`<a href="${esc(b.amazonLink)}" target="_blank" rel="noopener">También en Amazon ↗</a>`);
    $('#bmBody').dataset.book = b.id;
    $('#bmBody').innerHTML = `
      <div class="kicker">${b.draft ? 'Nueva incorporación' : 'Ficha editorial'}</div>
      <h2 id="bmTitle">${esc(b.title)}</h2>
      <div class="meta">${esc(meta)}</div>
      ${b.description ? `<p>${esc(b.description)}</p>` : '<p class="muted">Ficha en preparación. Pronto vas a encontrar acá la sinopsis completa.</p>'}
      ${b.quote ? `<blockquote>${esc(b.quote)}</blockquote>` : ''}
      <h3 class="bm-h">Formatos</h3>
      <ul class="fmt-list">${rows}</ul>
      ${links.length ? `<div class="bm-links">${links.join('')}</div>` : ''}`;
    drawer.classList.remove('open');
    modal.classList.add('open'); lock(true);
    $('.bm-close', modal).focus();
  }

  function onModalClick(e) {
    const n = e.target.closest('[data-notify]');
    if (n) { const f = $(`[data-notify-form="${n.dataset.notify}"]`, modal); f.hidden = !f.hidden; if (!f.hidden) $('input', f).focus(); }
    if (e.target.closest('.bm-add')) setTimeout(() => { openCart(); }, 350);
  }
  function onModalSubmit(e) {
    const form = e.target.closest('[data-notify-form]'); if (!form) return;
    e.preventDefault();
    const b = byId($('#bmBody').dataset.book);
    const data = { 'form-name': 'aviso-formato', obra: b.title, formato: SHOP.formats[form.dataset.notifyForm].label, email: $('input', form).value };
    post(data).then(() => { form.innerHTML = '<span class="ok">¡Listo! Te avisamos apenas esté disponible.</span>'; })
      .catch(() => { form.innerHTML = '<span class="err">No pudimos registrar tu correo. Escribinos a ' + esc(SHOP.contactEmail) + '.</span>'; });
  }

  /* ---------- UI: carrito ---------- */
  let step = 'cart', lastOrder = null;
  function openCart() {
    lastFocus = lastFocus || document.activeElement;
    modal.classList.remove('open'); step = 'cart';
    renderDrawer(); drawer.classList.add('open'); lock(true);
    $('.cd-x', drawer).focus();
  }
  function renderDrawer() {
    const main = $('#cdMain');
    if (step === 'done') {
      main.innerHTML = `<div class="cd-done"><div class="kicker">Pedido recibido</div><h3>¡Gracias!</h3>
        <p>Tu pedido <b>${esc(lastOrder.numero)}</b> quedó registrado. Te escribimos a <b>${esc(lastOrder.email)}</b> con las indicaciones de pago (${esc(lastOrder.medio)}) y, una vez confirmado, te enviamos los archivos.</p>
        <button class="btn" data-close>Seguir explorando</button></div>`;
      return;
    }
    if (!cart.length) {
      main.innerHTML = `<div class="cd-empty"><p>Todavía no agregaste ningún libro.</p><p class="muted">Elegí el formato que prefieras en la ficha de cada obra: ebook, libro navegable, audiolibro y, más adelante, edición impresa.</p><button class="btn" data-close>Ver catálogo</button></div>`;
      return;
    }
    const items = cart.map(i => {
      const b = byId(i.id), f = SHOP.formats[i.fmt];
      return `<li class="cd-item"><div class="cd-thumb">${cover(b)}</div>
        <div class="cd-info"><b>${esc(b.short)}</b><span>${esc(f.label)}</span>
          ${i.fmt === 'fisico' ? `<div class="qty"><button data-qty="-1" data-id="${esc(i.id)}" data-fmt="${i.fmt}" aria-label="Menos">−</button><span>${i.qty}</span><button data-qty="1" data-id="${esc(i.id)}" data-fmt="${i.fmt}" aria-label="Más">+</button></div>` : ''}
          <button class="rm" data-rm data-id="${esc(i.id)}" data-fmt="${i.fmt}">Quitar</button></div>
        <div class="cd-price">${money(price(b, i.fmt) * i.qty)}</div></li>`;
    }).join('');
    const hasPhysical = cart.some(i => i.fmt === 'fisico');
    if (step === 'cart') {
      main.innerHTML = `<ul class="cd-list">${items}</ul>
        <div class="cd-foot"><div class="cd-total"><span>Total</span><b>${money(total())}</b></div>
        <p class="muted small">Los formatos digitales se entregan por correo al confirmarse el pago.${hasPhysical ? ' El envío de la edición impresa se coordina aparte.' : ''}</p>
        <button class="btn gold block" data-step="checkout">Continuar con el pedido</button></div>`;
    } else {
      main.innerHTML = `<form class="cd-form" id="orderForm">
        <button type="button" class="back" data-step="cart">← Volver al carrito</button>
        <div class="cd-sum"><span>${count()} ${count() === 1 ? 'artículo' : 'artículos'}</span><b>${money(total())}</b></div>
        <label>Nombre y apellido<input required name="nombre" autocomplete="name"></label>
        <label>Correo electrónico<input required type="email" name="email" autocomplete="email"></label>
        <label>País<input required name="pais" autocomplete="country-name" value="Argentina"></label>
        <label>Medio de pago preferido<select name="medio_pago">${SHOP.paymentMethods.map(m => `<option>${esc(m)}</option>`).join('')}</select></label>
        ${hasPhysical ? '<label>Dirección de envío<input name="direccion" autocomplete="street-address"></label>' : ''}
        <label>Notas (opcional)<textarea name="notas" rows="2"></textarea></label>
        <p class="muted small">Al enviar, registramos tu pedido y te respondemos con el enlace o los datos de pago. No se cobra nada en este paso.</p>
        <p class="err" id="orderErr" hidden></p>
        <button class="btn gold block" type="submit">Enviar pedido · ${money(total())}</button></form>`;
    }
  }
  function onDrawerClick(e) {
    const s = e.target.closest('[data-step]'); if (s) { step = s.dataset.step; renderDrawer(); return; }
    const rm = e.target.closest('[data-rm]'); if (rm) { remove(rm.dataset.id, rm.dataset.fmt); return; }
    const q = e.target.closest('[data-qty]'); if (q) setQty(q.dataset.id, q.dataset.fmt, +q.dataset.qty);
  }
  function summary() {
    return cart.map(i => `${byId(i.id).title} — ${SHOP.formats[i.fmt].label} × ${i.qty} — ${money(price(byId(i.id), i.fmt) * i.qty)}`).join('\n');
  }
  function onCheckout(e) {
    const form = e.target.closest('#orderForm'); if (!form) return;
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(form));
    const d = new Date(), pad = n => String(n).padStart(2, '0');
    const numero = `AA-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const resumen = summary();
    const btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Enviando…';
    post({ 'form-name': 'pedido', numero, ...fd, pedido: resumen, total: money(total()) })
      .then(() => {
        lastOrder = { numero, email: fd.email, medio: fd.medio_pago };
        cart = []; save(); refresh(); step = 'done'; renderDrawer();
      })
      .catch(() => {
        const err = $('#orderErr'); err.hidden = false;
        const body = encodeURIComponent(`Pedido ${numero}\n\n${resumen}\n\nTotal: ${money(total())}\n\nNombre: ${fd.nombre}\nCorreo: ${fd.email}\nPaís: ${fd.pais}\nPago: ${fd.medio_pago}`);
        err.innerHTML = `No pudimos enviar el pedido automáticamente. <a href="mailto:${esc(SHOP.contactEmail)}?subject=${encodeURIComponent('Pedido ' + numero)}&body=${body}">Envialo por correo</a> y lo procesamos igual.`;
        btn.disabled = false; btn.textContent = 'Reintentar';
      });
  }

  /* ---------- contador del header ---------- */
  function refresh() {
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = count(); el.hidden = count() === 0; });
    if (drawer && drawer.classList.contains('open') && step !== 'checkout') renderDrawer();
  }

  document.addEventListener('DOMContentLoaded', () => { build(); refresh(); });
  return { esc, money, byId, cover, coverFallback, chips, status, price, fromPrice, buyable, add, openBook, openCart, toast, count };
})();

// Compatibilidad con los onclick="openBook('id')" del atlas
function openBook(id) { Shop.openBook(id); }
