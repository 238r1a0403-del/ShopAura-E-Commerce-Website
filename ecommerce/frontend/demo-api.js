/*
 * ShopAura — static demo mode
 *
 * When the store is hosted without the Express backend (e.g. GitHub Pages),
 * this script intercepts fetch() calls to /api/* and answers them from the
 * browser, mirroring the responses of backend/routes/*.js. Users, orders and
 * product stock are kept in localStorage, so every visitor gets a private sandbox.
 *
 * Demo mode turns on automatically on *.github.io, when opened as a local file,
 * or when the URL has ?demo=1. Running `npm start` locally uses the real API.
 */
(function () {
  const params = new URLSearchParams(location.search);
  const DEMO = params.get('demo') === '1'
    || location.hostname.endsWith('github.io')
    || location.protocol === 'file:';
  if (!DEMO || params.get('demo') === '0') return;

  const KEY = { products: 'demo_products', users: 'demo_users', orders: 'demo_orders', session: 'demo_session' };

  const SEED = [
    { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and hi-res audio. Perfect for music lovers and remote workers who need deep focus.', price: 2999, category: 'Electronics', stock: 50, rating: 4.5, numReviews: 120, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'RGB Mechanical Keyboard', description: 'Compact TKL mechanical keyboard with Cherry MX blue switches, per-key RGB lighting, and durable aluminium frame. Ideal for gaming and programming.', price: 4499, category: 'Electronics', stock: 30, rating: 4.7, numReviews: 85, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'Pro Running Shoes', description: 'Engineered mesh upper with responsive foam midsole for all-day comfort. Breathable, lightweight design ideal for long-distance running and daily training.', price: 1899, category: 'Sports', stock: 80, rating: 4.3, numReviews: 200, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'Premium Cotton T-Shirt', description: '100% organic cotton, pre-shrunk for a lasting fit. Ultra-soft jersey feel with reinforced stitching — available in 10 classic colours.', price: 499, category: 'Clothing', stock: 200, rating: 4.1, numReviews: 350, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'JavaScript: The Good Parts', description: 'Douglas Crockford guide to writing clean, robust JavaScript. A must-have for every web developer learning the language fundamentals.', price: 799, category: 'Books', stock: 45, rating: 4.8, numReviews: 500, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'Eco-Friendly Yoga Mat', description: 'Non-slip natural rubber yoga mat with printed alignment lines, 6mm cushioning for joint support. Includes carry strap. Great for yoga, pilates, and stretching.', price: 1299, category: 'Sports', stock: 60, rating: 4.6, numReviews: 175, image: 'https://images.unsplash.com/photo-1601925228126-8e8b71e0e9e9?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'LED Architect Desk Lamp', description: 'Minimalist LED desk lamp with 5 brightness levels, 3 colour temperatures, 360° adjustable arm, and a built-in USB-A charging port. Energy-efficient & eye-safe.', price: 899, category: 'Home', stock: 40, rating: 4.4, numReviews: 90, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'SPF 50 Face Moisturizer', description: 'Lightweight, non-greasy daily moisturizer with broad-spectrum SPF 50 protection. Dermatologist-tested, suitable for all skin types including sensitive skin.', price: 649, category: 'Beauty', stock: 100, rating: 4.2, numReviews: 280, image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'Smart Watch Pro', description: 'Feature-packed smartwatch with heart rate monitoring, built-in GPS, SpO2 sensor, sleep tracking, and 7-day battery. Compatible with Android & iOS.', price: 8999, category: 'Electronics', stock: 25, rating: 4.6, numReviews: 150, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'Stainless Steel Cookware Set', description: '5-piece professional-grade stainless steel cookware set with tempered glass lids. Tri-ply base for even heat distribution, compatible with all stovetops including induction.', price: 2499, category: 'Home', stock: 35, rating: 4.3, numReviews: 110, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'Creative Building Blocks Set', description: '520-piece colourful building block set for kids ages 6 and up. Stimulates creativity, spatial thinking, and fine motor skills. Compatible with major brick brands.', price: 1599, category: 'Toys', stock: 55, rating: 4.9, numReviews: 420, image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=450&fit=crop&auto=format&q=80' },
    { name: 'Portable Bluetooth Speaker', description: 'IPX7 waterproof Bluetooth 5.3 speaker with 360° surround sound, deep bass radiator, 12-hour playtime, and built-in mic for hands-free calls. Ideal for outdoors.', price: 1999, category: 'Electronics', stock: 45, rating: 4.5, numReviews: 195, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop&auto=format&q=80' }
  ];

  // ─── storage helpers ───
  const load = (k, fallback) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');

  function seedProducts() {
    const now = Date.now();
    const products = SEED.map((p, i) => ({ _id: `demo${String(i + 1).padStart(20, '0')}`, ...p, createdAt: new Date(now - i * 1000).toISOString() }));
    save(KEY.products, products);
    return products;
  }
  const products = () => load(KEY.products, null) || seedProducts();

  // Demo-only hashing: keeps plain passwords out of localStorage. Not real security.
  async function hash(text) {
    if (crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
    }
    return btoa(unescape(encodeURIComponent(text)));
  }

  const publicUser = u => ({ id: u._id, _id: u._id, name: u.name, email: u.email, role: u.role });
  const currentUser = () => {
    const id = load(KEY.session, null);
    return id ? load(KEY.users, []).find(u => u._id === id) || null : null;
  };

  // ─── route handlers (mirror backend/routes/*.js) ───
  const routes = [
    ['GET', /^\/api\/health$/, () => [200, { success: true, message: 'ShopAura demo API (browser-only) is running' }]],

    ['POST', /^\/api\/auth\/register$/, async (_, body) => {
      const { name, email, password } = body;
      if (!name || !email || !password) return [400, { success: false, message: 'All fields are required' }];
      if (password.length < 6) return [400, { success: false, message: 'Password must be at least 6 characters' }];
      const users = load(KEY.users, []);
      if (users.some(u => u.email === email.toLowerCase())) return [400, { success: false, message: 'Email already registered' }];
      const user = { _id: newId(), name, email: email.toLowerCase(), password: await hash(password), role: 'user', createdAt: new Date().toISOString() };
      users.push(user);
      save(KEY.users, users);
      save(KEY.session, user._id);
      return [201, { success: true, message: 'Registration successful', user: publicUser(user) }];
    }],

    ['POST', /^\/api\/auth\/login$/, async (_, body) => {
      const { email, password } = body;
      if (!email || !password) return [400, { success: false, message: 'Email and password are required' }];
      const user = load(KEY.users, []).find(u => u.email === email.toLowerCase());
      if (!user || user.password !== await hash(password)) return [401, { success: false, message: 'Invalid email or password' }];
      save(KEY.session, user._id);
      return [200, { success: true, message: 'Login successful', user: publicUser(user) }];
    }],

    ['POST', /^\/api\/auth\/logout$/, () => {
      localStorage.removeItem(KEY.session);
      return [200, { success: true, message: 'Logged out successfully' }];
    }],

    ['GET', /^\/api\/auth\/me$/, () => {
      const user = currentUser();
      return [200, user ? { success: true, user: publicUser(user) } : { success: false, user: null }];
    }],

    ['POST', /^\/api\/products\/seed\/run$/, () => {
      seedProducts();
      return [200, { success: true, message: `${SEED.length} products seeded successfully` }];
    }],

    ['GET', /^\/api\/products$/, (q) => {
      const page = Number(q.get('page') || 1), limit = Number(q.get('limit') || 12);
      const category = q.get('category'), search = (q.get('search') || '').toLowerCase(), sort = q.get('sort');
      const minPrice = q.get('minPrice'), maxPrice = q.get('maxPrice');
      let list = products().filter(p =>
        (!category || p.category === category) &&
        (!search || p.name.toLowerCase().includes(search)) &&
        (!minPrice || p.price >= Number(minPrice)) &&
        (!maxPrice || p.price <= Number(maxPrice)));
      const cmp = sort === 'price_asc' ? (a, b) => a.price - b.price
        : sort === 'price_desc' ? (a, b) => b.price - a.price
        : sort === 'rating' ? (a, b) => b.rating - a.rating
        : (a, b) => b.createdAt.localeCompare(a.createdAt);
      list = list.sort(cmp);
      const total = list.length;
      return [200, { success: true, products: list.slice((page - 1) * limit, page * limit), total, page, pages: Math.ceil(total / limit) }];
    }],

    ['GET', /^\/api\/products\/([^/]+)$/, (_, __, [id]) => {
      const product = products().find(p => p._id === id);
      return product ? [200, { success: true, product }] : [404, { success: false, message: 'Product not found' }];
    }],

    ['POST', /^\/api\/orders$/, (_, body) => {
      const user = currentUser();
      if (!user) return [401, { success: false, message: 'Please log in to continue' }];
      const { items, shippingAddress, paymentMethod } = body;
      if (!items || items.length === 0) return [400, { success: false, message: 'No items in order' }];
      const all = products();
      const orderItems = [];
      let totalPrice = 0;
      for (const item of items) {
        const product = all.find(p => p._id === item.productId);
        if (!product) return [404, { success: false, message: `Product not found: ${item.productId}` }];
        if (product.stock < item.quantity) return [400, { success: false, message: `Insufficient stock for ${product.name}` }];
        orderItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity, image: product.image });
        totalPrice += product.price * item.quantity;
      }
      orderItems.forEach(i => { all.find(p => p._id === i.product).stock -= i.quantity; });
      save(KEY.products, all);
      const now = new Date().toISOString();
      const order = { _id: newId(), user: user._id, items: orderItems, shippingAddress, totalPrice, paymentMethod: paymentMethod || 'COD', status: 'pending', createdAt: now, updatedAt: now };
      save(KEY.orders, [...load(KEY.orders, []), order]);
      return [201, { success: true, order }];
    }],

    ['GET', /^\/api\/orders\/my$/, () => {
      const user = currentUser();
      if (!user) return [401, { success: false, message: 'Please log in to continue' }];
      const orders = load(KEY.orders, []).filter(o => o.user === user._id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return [200, { success: true, orders }];
    }],

    ['GET', /^\/api\/orders\/([^/]+)$/, (_, __, [id]) => {
      const user = currentUser();
      if (!user) return [401, { success: false, message: 'Please log in to continue' }];
      const order = load(KEY.orders, []).find(o => o._id === id);
      if (!order) return [404, { success: false, message: 'Order not found' }];
      if (order.user !== user._id) return [403, { success: false, message: 'Access denied' }];
      return [200, { success: true, order }];
    }]
  ];

  // ─── fetch interceptor ───
  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init = {}) {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const apiIdx = url.pathname.indexOf('/api/');
    if (apiIdx === -1) return realFetch(input, init);

    const path = url.pathname.slice(apiIdx).replace(/\/$/, '');
    const method = (init.method || 'GET').toUpperCase();
    let body = {};
    try { body = init.body ? JSON.parse(init.body) : {}; } catch {}

    let status = 404, payload = { success: false, message: `Demo API: no route for ${method} ${path}` };
    for (const [m, re, handler] of routes) {
      const match = method === m && path.match(re);
      if (match) { [status, payload] = await handler(url.searchParams, body, match.slice(1)); break; }
    }
    await new Promise(r => setTimeout(r, 150)); // feel like a network call
    return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
  };

  // ─── demo badge ───
  function addBadge() {
    const badge = document.createElement('div');
    badge.innerHTML = '<strong>Demo mode</strong> · data stays in your browser · <a href="#" style="color:inherit">reset</a>';
    badge.style.cssText = 'position:fixed;left:1rem;bottom:1rem;z-index:250;background:#161618;border:1px solid #2a2a2e;color:#aaa;font:12px "DM Sans",sans-serif;padding:0.45rem 0.8rem;border-radius:999px;box-shadow:0 4px 16px rgba(0,0,0,0.4)';
    badge.querySelector('strong').style.color = '#e8ff47';
    badge.querySelector('a').addEventListener('click', e => {
      e.preventDefault();
      if (!confirm('Reset demo data? This clears demo accounts, orders, stock and your cart.')) return;
      [...Object.values(KEY), 'cart'].forEach(k => localStorage.removeItem(k));
      location.hash = '';
      location.reload();
    });
    document.body.appendChild(badge);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBadge);
  else addBadge();
})();
