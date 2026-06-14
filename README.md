# 🐄 VaraLakshmi Milk Agency — Website

A full-stack dairy e-commerce website built with **Node.js + Express** (backend) and **vanilla HTML/CSS/JS** (frontend).

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 3. Open your browser
```
http://localhost:3000
```

---

## 📁 Project Structure

```
radha-milk/
├── server.js            ← Express backend (API + static server)
├── package.json
├── public/
│   ├── index.html       ← Single-page app (SPA)
│   ├── css/
│   │   └── style.css    ← All styles
│   └── js/
│       └── app.js       ← All frontend logic
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/products         | All products (filterable) |
| GET    | /api/products/:id     | Single product           |
| GET    | /api/categories       | All categories           |
| POST   | /api/register         | Create account           |
| POST   | /api/login            | Login                    |
| POST   | /api/orders           | Place an order           |
| GET    | /api/orders/:userId   | Get user's orders        |

### Query params for `/api/products`
- `?category=Milk` — filter by category
- `?search=butter` — search by name
- `?featured=true` — featured products only

---

## ✨ Features

- **Home page** — Hero, categories, featured products, features section
- **Product catalog** — Search + category filter
- **Shopping cart** — Sidebar with qty controls
- **User auth** — Register & login (in-memory, no DB needed)
- **Order placement** — Checkout with delivery address
- **Order history** — Per-user order tracking
- **About & Contact** — Info pages
- **Responsive** — Works on mobile, tablet, desktop

---

## 🗄️ Upgrading to a real database

The server uses in-memory arrays. To persist data, replace the arrays with:
- **SQLite** — `npm install better-sqlite3`
- **MongoDB** — `npm install mongoose`
- **PostgreSQL** — `npm install pg`

---

## 🛠 Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Backend  | Node.js, Express            |
| Frontend | HTML5, CSS3, Vanilla JS     |
| Fonts    | Google Fonts (Nunito, Playfair Display) |
| Deploy   | Any Node.js host (Railway, Render, etc.) |
