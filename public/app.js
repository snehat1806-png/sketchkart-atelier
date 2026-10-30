/* SketchKart – connects the pages to the backend. Plain JavaScript. */
const $ = (s) => document.querySelector(s);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
let token = localStorage.getItem('token');
let me = JSON.parse(localStorage.getItem('me') || 'null');
let cart = (JSON.parse(localStorage.getItem('cart') || '[]')).filter((i) => i.id); // old cart items had no id
const saveCart = () => { localStorage.setItem('cart', JSON.stringify(cart)); updateHeader(); };

function toast(msg) {
  let t = $('#sk-toast'); if (!t) { t = document.createElement('div'); t.id = 'sk-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800);
}
async function api(url, opts = {}) {
  const isForm = opts.body instanceof FormData;
  const res = await fetch('/api' + url, {
    method: opts.method || 'GET',
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(opts.body && !isForm ? { 'Content-Type': 'application/json' } : {}) },
    body: opts.body ? (isForm ? opts.body : JSON.stringify(opts.body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}
const safe = (fn) => async (...a) => { try { await fn(...a); } catch (e) { toast(e.message); } };
const setAuth = (d) => { token = d.token; me = d.user; localStorage.setItem('token', token); localStorage.setItem('me', JSON.stringify(me)); };
const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('me'); location.href = 'index.html'; };

function updateHeader() {
  const u = $('.user-account');
  if (u) {
    u.querySelector('span').textContent = 'Hello, ' + (me ? me.name.split(' ')[0] : 'User');
    u.querySelector('small').textContent = me ? 'Orders & Account' : 'Log in / Join';
    u.href = me ? 'orders.html' : 'login.html';
  }
  const c = $('.cart'); if (c) c.innerHTML = '🛒 Cart' + (cart.length ? `<span class="cart-n">${cart.length}</span>` : '');
}

/* ---------- cart buttons (home page + shop pages) ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('.add-to-cart'); if (!b) return;
  if (!b.dataset.id) return toast('Start the server to load real artworks.');
  if (cart.some((i) => i.id === b.dataset.id)) return toast('Already in your cart. Each artwork is one of a kind.');
  cart.push({ id: b.dataset.id, name: b.dataset.name, price: +b.dataset.price, image: b.dataset.image });
  saveCart(); toast('Added to cart');
});

const card = (a) => `<article class="product-card"><img src="${a.image}" alt="${esc(a.title)}"><h3>${esc(a.title)}</h3><p class="artist-name">By ${esc(a.artist.name)}</p><p class="price">${inr(a.price)}</p><button class="add-to-cart" data-id="${a._id}" data-name="${esc(a.title)}" data-price="${a.price}" data-image="${a.image}">Add to Cart</button></article>`;

/* ---------- pages ---------- */
const pages = {
  async home() { // replace the hard-coded featured products with real ones, if the server answers
    const list = await api('/artworks?limit=4'); const box = $('.product-container');
    if (box && list.length) box.innerHTML = list.map(card).join('');
  },

  async shop(el) {
    const cat = el.dataset.cat;
    el.innerHTML = `<h1>${cat}</h1><p class="sk-sub">Handmade by independent artists.</p><div class="sk-bar"><input id="q" placeholder="Search in ${cat}"></div><div class="product-container" id="list"></div>`;
    const load = safe(async () => {
      const list = await api(`/artworks?category=${encodeURIComponent(cat)}&q=${encodeURIComponent($('#q').value)}`);
      $('#list').innerHTML = list.length ? list.map(card).join('') : '<div class="sk-empty" style="grid-column:1/-1">Nothing here yet. Check back soon, or ask an artist for a custom piece.</div>';
    });
    let t; $('#q').oninput = () => { clearTimeout(t); t = setTimeout(load, 250); }; load();
  },

  async artists(el) {
    const list = await api('/artists');
    el.innerHTML = `<h1>Our Artists</h1><p class="sk-sub">Ask any artist for a custom piece.</p><div class="product-container">${list.length ? list.map((a) => `<article class="product-card"><h3>${esc(a.name)}</h3><p class="artist-name">${esc(a.city || '')}</p><p>${esc(a.bio || '')}</p><a href="custom.html?artist=${a.id}">Request custom art</a></article>`).join('') : '<div class="sk-empty">No artists yet.</div>'}</div>`;
  },

  login(el) {
    const q = new URLSearchParams(location.search); let mode = q.get('mode') === 'register' ? 'register' : 'login';
    const draw = () => {
      const reg = mode === 'register';
      el.innerHTML = `<div class="sk-tabs"><button class="${!reg ? 'on' : ''}" data-m="login">Log in</button><button class="${reg ? 'on' : ''}" data-m="register">Create account</button></div><div class="sk-panel"><form id="f">
      ${reg ? `<label>I want to</label><select name="role"><option value="customer">Buy or order art</option><option value="artist">Sell my art (artist)</option></select><label>Full name</label><input name="name" required>` : ''}
      <label>Email</label><input name="email" type="email" required><label>Password</label><input name="password" type="password" minlength="6" required>
      ${reg ? '<div id="af" hidden><label>City</label><input name="city"><label>About you and your art</label><textarea name="bio" rows="3"></textarea></div>' : ''}
      <p style="margin-top:18px"><button class="sk-btn">${reg ? 'Create account' : 'Log in'}</button></p></form></div>`;
      el.querySelectorAll('.sk-tabs button').forEach((b) => (b.onclick = () => { mode = b.dataset.m; draw(); }));
      const f = $('#f'); if (reg) f.role.onchange = () => ($('#af').hidden = f.role.value !== 'artist');
      f.onsubmit = safe(async (e) => { e.preventDefault(); setAuth(await api('/auth/' + mode, { method: 'POST', body: Object.fromEntries(new FormData(f)) })); location.href = me.role === 'artist' ? 'sell.html' : (q.get('next') || 'index.html'); });
    };
    draw();
  },

  cart(el) {
    const total = cart.reduce((s, i) => s + i.price, 0);
    el.innerHTML = `<h1>Your Cart</h1>${cart.length ? `${cart.map((i) => `<div class="sk-item"><img src="${i.image}" alt=""><div><b>${esc(i.name)}</b><div class="sk-meta">One of a kind</div></div><div>${inr(i.price)} <button class="sk-btn light small" data-rm="${i.id}">Remove</button></div></div>`).join('')}
    <div class="sk-panel" style="margin-top:18px"><p><b>Total: ${inr(total)}</b></p><label>Delivery address</label><textarea id="addr" rows="3" style="width:100%;padding:10px"></textarea><p style="margin-top:14px"><button class="sk-btn" id="go">Place order</button></p></div>` : '<div class="sk-empty">Your cart is empty. <a href="index.html#collections">Browse collections</a></div>'}`;
    el.onclick = (e) => { const r = e.target.closest('[data-rm]'); if (r) { cart = cart.filter((i) => i.id !== r.dataset.rm); saveCart(); pages.cart(el); } };
    const go = $('#go'); if (go) go.onclick = safe(async () => {
      if (!me) { location.href = 'login.html?next=cart.html'; return; }
      if (me.role !== 'customer') throw new Error('Log in as a customer to place orders.');
      await api('/orders/checkout', { method: 'POST', body: { items: cart.map((i) => i.id), address: $('#addr').value } });
      cart = []; saveCart(); toast('Order placed. Pay to confirm it.'); location.href = 'orders.html';
    });
  },

  sell(el) {
    if (me?.role !== 'artist') { el.innerHTML = '<div class="sk-empty">Only artists can sell. <a href="login.html?mode=register">Create an artist account</a></div>'; return; }
    el.innerHTML = `<h1>Sell on SketchKart</h1><p class="sk-sub">Add an artwork. Customers will see it right away.</p><div class="sk-panel"><form id="f"><label>Photo of the artwork</label><input name="image" type="file" accept="image/*" required>
    <label>Title</label><input name="title" required><label>Category</label><select name="category"><option>Sketches</option><option>Paintings</option><option>Portraits</option><option>Custom Gifts</option></select>
    <label>Size (for example A4)</label><input name="size"><label>Price in ₹</label><input name="price" type="number" min="1" required><label>Description</label><textarea name="description" rows="3"></textarea>
    <p style="margin-top:18px"><button class="sk-btn">Publish artwork</button></p></form></div>`;
    $('#f').onsubmit = safe(async (e) => { e.preventDefault(); await api('/artworks', { method: 'POST', body: new FormData(e.target) }); e.target.reset(); toast('Artwork published'); });
  },

  async custom(el) {
    if (me?.role !== 'customer') { el.innerHTML = '<div class="sk-empty">Log in as a customer to request custom art. <a href="login.html?mode=register&next=custom.html">Join now</a></div>'; return; }
    const artists = await api('/artists'); const pre = new URLSearchParams(location.search).get('artist');
    el.innerHTML = `<h1>Request custom art</h1><p class="sk-sub">The artist replies with a price and date. You pay only after you accept.</p><div class="sk-panel"><form id="f"><label>Artist</label><select name="artistId">${artists.map((a) => `<option value="${a.id}" ${a.id === pre ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select>
    <label>What should the artist make?</label><textarea name="details" rows="4" required></textarea><label>Reference photo (optional)</label><input name="refImage" type="file" accept="image/*">
    <label>Size</label><input name="size"><label>Needed by (optional)</label><input name="deadline" type="date"><label>Delivery address</label><textarea name="address" rows="2" required></textarea>
    <p style="margin-top:18px"><button class="sk-btn">Send request</button></p></form></div>`;
    $('#f').onsubmit = safe(async (e) => { e.preventDefault(); await api('/orders/custom', { method: 'POST', body: new FormData(e.target) }); toast('Request sent'); location.href = 'orders.html'; });
  },

  async orders(el) {
    if (!me) { location.href = 'login.html?next=orders.html'; return; }
    const artist = me.role === 'artist'; const orders = await api('/orders/mine');
    const FLOW = ['requested', 'quoted', 'awaiting_payment', 'paid', 'in_progress', 'delivered'];
    const LABEL = { requested: 'Waiting for artist', quoted: 'Price offered', awaiting_payment: 'Awaiting payment', paid: 'Paid', in_progress: 'Being made', delivered: 'Delivered', rejected: 'Declined' };
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><h1>${artist ? 'Orders received' : 'My orders'}</h1><button class="sk-btn light small" id="out">Log out</button></div>${orders.length ? orders.map((o) => {
      const idx = FLOW.indexOf(o.status); const acts = []; const id = o._id;
      if (artist) {
        if (o.status === 'requested') acts.push(`<input id="p${id}" type="number" placeholder="Price ₹"><input id="d${id}" type="date"><button class="sk-btn small" data-a="quote" data-id="${id}">Send price</button><button class="sk-btn light small" data-a="reject" data-id="${id}">Decline</button>`);
        if (o.status === 'paid') acts.push(`<button class="sk-btn small" data-a="start" data-id="${id}">Start work</button>`);
        if (['paid', 'in_progress'].includes(o.status)) acts.push(`<button class="sk-btn small" data-a="deliver" data-id="${id}">Mark delivered</button>`);
      } else {
        if (o.status === 'quoted') acts.push(`<button class="sk-btn small" data-c="accept" data-id="${id}">Accept ${inr(o.price)}</button>`);
        if (o.status === 'awaiting_payment') acts.push(`<button class="sk-btn small" data-c="pay" data-id="${id}">Pay ${inr(o.price)}</button>`);
        if (o.status === 'delivered' && !o.reviewed) acts.push(`<select id="r${id}">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${n} ★</option>`).join('')}</select><input id="rc${id}" placeholder="Your review"><button class="sk-btn small" data-c="review" data-id="${id}">Submit review</button>`);
      }
      return `<div class="sk-order"><b>${o.type === 'ready' ? esc(o.artwork?.title || 'Artwork') : 'Custom art'}</b><span class="sk-tag">${LABEL[o.status]}</span>
        <div class="sk-meta">${artist ? 'Customer: ' + esc(o.customer.name) : 'Artist: ' + esc(o.artist.name)}${o.price ? ' · ' + inr(o.price) : ''}${o.deadline ? ' · by ' + esc(o.deadline) : ''}</div>
        ${o.details ? `<p>${esc(o.details)}${o.size ? ' (' + esc(o.size) + ')' : ''}</p>` : ''}${o.refImage ? `<a href="${o.refImage}" target="_blank">Reference photo</a>` : ''}${artist ? `<div class="sk-meta">Deliver to: ${esc(o.address)}</div>` : ''}
        ${o.status !== 'rejected' ? `<div class="sk-steps">${(o.type === 'ready' ? FLOW.slice(2) : FLOW).map((s) => `<i class="${FLOW.indexOf(s) <= idx ? 'on' : ''}" title="${LABEL[s]}"></i>`).join('')}</div>` : ''}<div class="acts">${acts.join('')}</div></div>`;
    }).join('') : `<div class="sk-empty">No orders yet. ${artist ? '' : '<a href="index.html#collections">Browse collections</a>'}</div>`}`;
    $('#out').onclick = logout;
    el.onclick = safe(async (e) => {
      const b = e.target.closest('button[data-id]'); if (!b) return; const id = b.dataset.id;
      if (b.dataset.a) { const body = { action: b.dataset.a }; if (body.action === 'quote') { body.price = +$('#p' + id).value; body.deadline = $('#d' + id).value; } await api('/orders/' + id, { method: 'PATCH', body }); }
      if (b.dataset.c === 'accept') await api(`/orders/${id}/accept`, { method: 'POST' });
      if (b.dataset.c === 'pay') { await api(`/orders/${id}/pay`, { method: 'POST' }); toast('Payment received (demo mode)'); }
      if (b.dataset.c === 'review') await api(`/orders/${id}/review`, { method: 'POST', body: { rating: +$('#r' + id).value, comment: $('#rc' + id).value } });
      pages.orders(el);
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  updateHeader();
  const el = $('#page'); const name = el ? el.dataset.page : $('.product-container') ? 'home' : null;
  if (name && pages[name]) safe(() => pages[name](el))();
});
