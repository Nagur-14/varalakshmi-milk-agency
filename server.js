const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── In-memory data ───────────────────────────────────────────────
const products = [
  { id: 1,  name: 'Toned Milk',            category: 'Milk',          price: 28,  unit: '500 ml', stock: true, featured: true,  emoji: '🥛' },
  { id: 2,  name: 'Cow Milk',              category: 'Milk',          price: 38,  unit: '500 ml', stock: true, featured: true,  emoji: '🐄' },
  { id: 3,  name: 'Buffalo Milk',          category: 'Milk',          price: 42,  unit: '500 ml', stock: true, featured: true,  emoji: '🥛' },
  { id: 4,  name: 'Full Cream Milk',       category: 'Milk',          price: 32,  unit: '500 ml', stock: true, featured: false, emoji: '🥛' },
  { id: 5,  name: 'Chocolate Flavored Milk', category: 'Milk',        price: 25,  unit: '200 ml', stock: true, featured: true,  emoji: '🍫' },
  { id: 6,  name: 'Butter',               category: 'Butter & Cream', price: 60,  unit: '100 g',  stock: true, featured: false, emoji: '🧈' },
  { id: 7,  name: 'White Butter',         category: 'Butter & Cream', price: 70,  unit: '200 g',  stock: true, featured: false, emoji: '🧈' },
  { id: 8,  name: 'Fresh Cream',          category: 'Butter & Cream', price: 90,  unit: '200 ml', stock: true, featured: false, emoji: '🍶' },
  { id: 9,  name: 'Pure Ghee',            category: 'Other Dairy',    price: 550, unit: '500 ml', stock: true, featured: false, emoji: '🫙' },
  { id: 10, name: 'Vanilla Ice Cream Cup', category: 'Ice Cream',     price: 40,  unit: '100 ml', stock: true, featured: false, emoji: '🍨' },
  { id: 11, name: 'Chocolate Ice Cream',  category: 'Ice Cream',      price: 50,  unit: '100 ml', stock: true, featured: false, emoji: '🍦' },
  { id: 12, name: 'Biscuits',             category: 'Add-ons',        price: 25,  unit: '200 g',  stock: true, featured: false, emoji: '🍪' },
  { id: 13, name: 'Bread Loaf',           category: 'Add-ons',        price: 45,  unit: '400 g',  stock: true, featured: false, emoji: '🍞' },
];

const users = [];     // { id, name, email, password, phone }
const orders = [];    // { id, userId, items, total, status, date, address }
let nextUserId = 1;
let nextOrderId = 1;

// ─── Helper ───────────────────────────────────────────────────────
const findUser = (email) => users.find(u => u.email === email);

// ─── API: Products ────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category, search, featured } = req.query;
  let list = [...products];
  if (category && category !== 'All') list = list.filter(p => p.category === category);
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (featured === 'true') list = list.filter(p => p.featured);
  res.json(list);
});

app.get('/api/products/:id', (req, res) => {
  const p = products.find(p => p.id === +req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});

// ─── API: Auth ────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (findUser(email)) return res.status(409).json({ error: 'Email already registered' });
  const user = { id: nextUserId++, name, email, password, phone };
  users.push(user);
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

// ─── API: Orders ──────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { userId, items, total, address } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items' });
  const order = { id: nextOrderId++, userId, items, total, address, status: 'Confirmed', date: new Date().toISOString() };
  orders.push(order);
  res.json({ success: true, order });
});

app.get('/api/orders/:userId', (req, res) => {
  const userOrders = orders.filter(o => o.userId === +req.params.userId);
  res.json(userOrders.reverse());
});

// ─── API: Categories ──────────────────────────────────────────────
app.get('/api/categories', (req, res) => {
  const cats = ['Milk', 'Butter & Cream', 'Ice Cream', 'Other Dairy', 'Add-ons'];
  res.json(cats);
});

// ─── Serve frontend ───────────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`VaraLakshmi Milk Agency running at http://localhost:${PORT}`));
