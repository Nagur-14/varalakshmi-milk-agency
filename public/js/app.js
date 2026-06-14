/* ═══ STATE ═══════════════════════════════════════════════════ */
let cart = JSON.parse(localStorage.getItem('rm_cart') || '[]');
let currentUser = JSON.parse(localStorage.getItem('rm_user') || 'null');
let allProducts = [];
let activeCategory = 'All';

const API = '/api';

/* ═══ INIT ════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  updateAuthUI();
  updateCartUI();
  await loadCategories();
  await loadFeaturedProducts();
  showPage('home');
});

/* ═══ NAVIGATION ══════════════════════════════════════════════ */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  const link = document.querySelector(`.nav-link[onclick*="${page}"]`);
  if (link) link.classList.add('active');

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');

  if (page === 'products') loadAllProducts();
  if (page === 'orders') loadOrders();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

/* ═══ CATEGORIES ══════════════════════════════════════════════ */
const categoryIcons = {
  'Milk': '🥛', 'Butter & Cream': '🧈', 'Ice Cream': '🍨',
  'Other Dairy': '🫙', 'Add-ons': '🍪'
};

async function loadCategories() {
  const cats = await fetchAPI('/categories');
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  grid.innerHTML = cats.map(c => `
    <div class="category-card" onclick="showPage('products');setCategory('${c}')">
      <span class="category-icon">${categoryIcons[c] || '🍶'}</span>
      <span class="category-name">${c}</span>
    </div>`).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === cat);
  });
  renderProductGrid(document.getElementById('allProductsGrid'), allProducts.filter(p =>
    cat === 'All' ? true : p.category === cat
  ));
}

/* ═══ PRODUCTS ════════════════════════════════════════════════ */
async function loadFeaturedProducts() {
  const products = await fetchAPI('/products?featured=true');
  renderProductGrid(document.getElementById('featuredGrid'), products);
}

async function loadAllProducts() {
  if (!allProducts.length) {
    allProducts = await fetchAPI('/products');
  }
  renderFilterTabs();
  filterProducts();
}

function renderFilterTabs() {
  const tabs = document.getElementById('filterTabs');
  const cats = ['All', 'Milk', 'Butter & Cream', 'Ice Cream', 'Other Dairy', 'Add-ons'];
  tabs.innerHTML = cats.map(c => `
    <button class="filter-tab ${c === activeCategory ? 'active' : ''}" data-cat="${c}" onclick="setCategory('${c}')">${c}</button>
  `).join('');
}

function filterProducts() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  let filtered = allProducts;
  if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
  renderProductGrid(document.getElementById('allProductsGrid'), filtered);
}

function renderProductGrid(container, products) {
  if (!container) return;
  if (!products.length) {
    container.innerHTML = '<div class="no-results">😔 No products found</div>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-image">
        <span class="in-stock-badge">In Stock</span>
        <span>${p.emoji || '🥛'}</span>
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-unit">${p.unit}</div>
        <div class="product-footer">
          <span class="product-price">₹${p.price}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">Add</button>
        </div>
      </div>
    </div>`).join('');
}

/* ═══ CART ════════════════════════════════════════════════════ */
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId) ||
    [...document.querySelectorAll('.product-card')].map(() => null).filter(Boolean)[0];

  // If products not loaded yet, fetch
  if (!allProducts.length) {
    fetchAPI('/products').then(prods => {
      allProducts = prods;
      addToCart(productId);
    });
    return;
  }

  const p = allProducts.find(p => p.id === productId);
  if (!p) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: p.id, name: p.name, price: p.price, unit: p.unit, emoji: p.emoji || '🥛', qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${p.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); }
}

function saveCart() {
  localStorage.setItem('rm_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const emptyEl = document.getElementById('cartEmpty');

  if (!cart.length) {
    itemsEl.innerHTML = '';
    footerEl.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';
  document.getElementById('cartTotal').textContent = `₹${total}`;

  itemsEl.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-icon">${i.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">₹${i.price} × ${i.qty} = ₹${i.price * i.qty}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i.id},-1)">−</button>
          <span class="qty-num">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i.id},1)">+</button>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${i.id})" title="Remove">🗑</button>
    </div>`).join('');
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

/* ═══ CHECKOUT ════════════════════════════════════════════════ */
function checkout() {
  if (!currentUser) {
    toggleCart();
    showModal('loginModal');
    showToast('Please login to place an order');
    return;
  }
  toggleCart();
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const summary = document.getElementById('orderSummary');
  summary.innerHTML = `
    <p>${cart.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
    <strong>Total: ₹${total}</strong>`;
  showModal('checkoutModal');
}

async function placeOrder(e) {
  e.preventDefault();
  const address = document.getElementById('deliveryAddress').value;
  const phone = document.getElementById('deliveryPhone').value;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const data = await fetchAPI('/orders', 'POST', {
    userId: currentUser.id,
    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total,
    address: `${address} | Ph: ${phone}`
  });

  if (data.success) {
    cart = [];
    saveCart();
    updateCartUI();
    closeModal('checkoutModal');
    showToast('🎉 Order placed successfully!');
    setTimeout(() => showPage('orders'), 1000);
  }
}

/* ═══ AUTH ════════════════════════════════════════════════════ */
async function login(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  const data = await fetchAPI('/login', 'POST', { email, password });
  if (data.success) {
    currentUser = data.user;
    localStorage.setItem('rm_user', JSON.stringify(currentUser));
    closeModal('loginModal');
    updateAuthUI();
    showToast(`Welcome back, ${currentUser.name}! 👋`);
  } else {
    errEl.textContent = data.error || 'Login failed';
  }
}

async function register(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('regPhone').value;
  const password = document.getElementById('regPassword').value;
  const errEl = document.getElementById('regError');
  errEl.textContent = '';

  const data = await fetchAPI('/register', 'POST', { name, email, phone, password });
  if (data.success) {
    currentUser = data.user;
    localStorage.setItem('rm_user', JSON.stringify(currentUser));
    closeModal('registerModal');
    updateAuthUI();
    showToast(`Account created! Welcome, ${currentUser.name}! 🎉`);
  } else {
    errEl.textContent = data.error || 'Registration failed';
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('rm_user');
  updateAuthUI();
  showToast('Logged out successfully');
}

function updateAuthUI() {
  const authBtns = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');
  if (currentUser) {
    authBtns.style.display = 'none';
    userMenu.style.display = 'flex';
    userMenu.style.alignItems = 'center';
    userMenu.style.gap = '10px';
    userName.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
  } else {
    authBtns.style.display = 'flex';
    authBtns.style.gap = '8px';
    userMenu.style.display = 'none';
  }
}

/* ═══ ORDERS ════════════════════════════════════════════════ */
async function loadOrders() {
  const el = document.getElementById('ordersContent');
  if (!currentUser) {
    el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--gray-400)">
      <p style="font-size:2rem">📦</p>
      <p style="margin:12px 0;font-weight:700">Please login to view orders</p>
      <button class="btn btn-primary" onclick="showModal('loginModal')">Login</button>
    </div>`;
    return;
  }
  const orders = await fetchAPI(`/orders/${currentUser.id}`);
  if (!orders.length) {
    el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--gray-400)">
      <p style="font-size:2rem">📦</p>
      <p style="margin:12px 0;font-weight:700">No orders yet</p>
      <button class="btn btn-primary" onclick="showPage('products')">Shop Now</button>
    </div>`;
    return;
  }
  el.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">Order #${o.id}</span>
        <span class="order-status">${o.status}</span>
      </div>
      <div class="order-items">${o.items.map(i => `${i.name} ×${i.qty}`).join(' · ')}</div>
      <div class="order-footer">
        <span>${new Date(o.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
        <span class="order-total">₹${o.total}</span>
      </div>
    </div>`).join('');
}

/* ═══ CONTACT ════════════════════════════════════════════════ */
function submitContact(e) {
  e.preventDefault();
  showToast('Message sent! We\'ll get back to you soon. 😊');
  e.target.reset();
}

/* ═══ MODALS ════════════════════════════════════════════════ */
function showModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
function switchModal(from, to) { closeModal(from); setTimeout(() => showModal(to), 100); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }

/* ═══ TOAST ══════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ═══ FETCH HELPER ═══════════════════════════════════════════ */
async function fetchAPI(path, method = 'GET', body = null) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null
    });
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return {};
  }
}
