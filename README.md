<div align="center">

<!-- Animated Header Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0066ff,50:1a1a2e,100:ffd60a&height=200&section=header&text=Dchal%20Store&fontSize=60&fontAlignY=38&fontColor=ffffff&animation=fadeIn&desc=Modern%20E-Commerce%20for%20Electronics%20Reseller&descAlignY=60&descSize=16&descColor=94a3b8" width="100%"/>

<!-- Typing animation via readme-typing-svg -->
[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=0066FF&center=true&vCenter=true&width=600&lines=Full-Stack+E-Commerce+Platform;Node.js+%2B+Vue+3+%2B+MongoDB;Midtrans+Payment+%2B+Biteship+Shipping;Built+for+Indonesian+Electronics+Resellers)](https://git.io/typing-svg)

<br/>

<!-- Stack Badges -->
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

<br/>

<!-- Status Badges -->
![Status](https://img.shields.io/badge/Status-Active%20Development-0066ff?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-ffd60a?style=flat-square)
![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)
![Made in Indonesia](https://img.shields.io/badge/Made%20in-Indonesia-DC143C?style=flat-square)

</div>

---

<!-- Feature showcase with animated SVG -->
<div align="center">

```
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │    Kabel · Casing HP · Earphone · Charger · Powerbank      │
  │                                                             │
  │    Payment via Midtrans  ·  Shipping via Biteship           │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

</div>

---

## Overview

Dchal Store is a production-ready full-stack e-commerce platform built for Indonesian electronics accessory resellers. It features a complete shopping experience - from product discovery to multi-courier checkout — with real payment integration via Midtrans and real-time shipping calculation via Biteship.

**Why Dchal Store?**

Most open-source e-commerce templates either use outdated stacks or lack real payment integration. This project bridges that gap with a modern Vue 3 + Node.js architecture and first-class Indonesian payment/logistics support out of the box.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DCHAL STORE                                      │
├────────────────────────────┬────────────────────────────────────────────────┤
│         FRONTEND           │                BACKEND                         │
│         Vue 3 + Vite       │         Node.js + Express                      │
│         Pinia State        │         JWT Authentication                     │
│         Vue Router 4       │         REST API                               │
├────────────────────────────┴────────────────────────────────────────────────┤
│                           INTEGRATIONS                                      │
│                                                                             │
│   Midtrans Snap          Biteship API          MongoDB Atlas                │
│   (Payment Gateway)      (Multi-Courier)       (Database)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

<table>
<tr>
<td width="50%">

**Storefront**
- Product catalog with filter, search, and sort
- Category browsing (6 categories)
- Product detail with image gallery and specs table
- Cart with persistent state (localStorage)
- Multi-step checkout wizard

</td>
<td width="50%">

**Admin Dashboard**
- Real-time sales statistics
- Product CRUD with image management
- Toggle active/featured without reload
- Order management with status updates
- Revenue chart (7-day trend)

</td>
</tr>
<tr>
<td width="50%">

**Payment & Shipping**
- Midtrans Snap popup (all payment methods)
- Biteship area autocomplete (debounced)
- Multi-courier rate comparison
- Auto-create shipping order on payment
- Webhook handler (idempotent)

</td>
<td width="50%">

**Authentication**
- JWT-based auth with token persistence
- Role-based access (admin / customer)
- Protected routes (frontend + backend)
- Auto-redirect by role on login
- Saved shipping addresses

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Vue 3 (Composition API) | 3.4 |
| Build Tool | Vite | 5.x |
| State Management | Pinia | 2.x |
| Routing | Vue Router | 4.x |
| HTTP Client | Axios | 1.x |
| Backend Framework | Express | 4.x |
| Database | MongoDB + Mongoose | 7.x |
| Authentication | JSON Web Token | - |
| Payment Gateway | Midtrans Snap | - |
| Shipping API | Biteship | - |
| Password Hashing | bcryptjs | - |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB running locally (or MongoDB Atlas URI)
- Midtrans account — [midtrans.com](https://midtrans.com)
- Biteship account — [biteship.com](https://biteship.com)

### 1. Clone & Install

```bash
git clone https://github.com/Theikol/dchal-store.git
cd dchal-store

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** — copy and fill:

```bash
cd backend
cp .env.example .env
```

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dchal-store
JWT_SECRET=your-super-secret-key-here

MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false

BITESHIP_API_KEY=your-biteship-key
BITESHIP_BASE_URL=https://api.biteship.com
STORE_ORIGIN_AREA_ID=IDNP6IDNC149IDND2074IDZ17530
STORE_ORIGIN_POSTAL_CODE=17530

FRONTEND_URL=http://localhost:5173
```

**Frontend** — copy and fill:

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
```

Also update `frontend/index.html` — replace `YOUR_CLIENT_KEY` in the Midtrans Snap script tag.

### 3. Seed Database

```bash
cd backend
node utils/seeder.js
```

This creates 2 test accounts and 6 sample products.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dchalstore.com | admin123 |
| Customer | customer@example.com | customer123 |

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Payment Testing

This project uses Midtrans **Sandbox** mode by default. Use these test credentials:

```
Card Number : 4811 1111 1111 1114  (Visa — Success)
CVV         : 123
Expiry      : Any future date
OTP         : 112233
```

For webhook testing, expose the backend with ngrok:

```bash
ngrok http 5000
```

Then register the tunnel URL in your Midtrans dashboard:

```
Settings → Configuration → Payment Notification URL
→ https://YOUR_NGROK_URL/api/orders/midtrans-notification
```

---

## API Reference

<details>
<summary><strong>Authentication</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/login` | - | Login, returns JWT |
| GET | `/api/auth/profile` | Bearer | Get current user profile |
| POST | `/api/auth/addresses` | Bearer | Add shipping address |

</details>

<details>
<summary><strong>Products</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | - | List with filter/search/sort/pagination |
| GET | `/api/products/:slug` | - | Product detail |
| GET | `/api/products/featured/list` | - | Featured products (homepage) |
| GET | `/api/products/admin/all` | Admin | All products including inactive |
| GET | `/api/products/admin/:id` | Admin | Single product by ID (for edit form) |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

</details>

<details>
<summary><strong>Orders</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Bearer | Create order, returns Snap token |
| GET | `/api/orders/myorders` | Bearer | Current user's orders |
| GET | `/api/orders/:orderNumber` | Bearer | Order detail |
| POST | `/api/orders/midtrans-notification` | Public | Midtrans webhook receiver |
| GET | `/api/orders/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/api/orders/admin/all` | Admin | All orders |
| PUT | `/api/orders/admin/:id/status` | Admin | Update order status |

</details>

<details>
<summary><strong>Shipping</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/shipping/areas?query=` | - | Area autocomplete via Biteship |
| POST | `/api/shipping/rates` | - | Calculate shipping rates |
| GET | `/api/shipping/track/:orderId` | - | Track shipment |

</details>

---

## Project Structure

```
dchal-store/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── shippingController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # protect + adminOnly
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   └── shippingRoutes.js
│   ├── utils/
│   │   ├── biteshipService.js
│   │   ├── generateToken.js
│   │   ├── midtransService.js
│   │   └── seeder.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AppHeader.vue
    │   │   ├── AppFooter.vue
    │   │   ├── AppToast.vue
    │   │   └── ProductCard.vue
    │   ├── views/
    │   │   ├── HomeView.vue
    │   │   ├── ProductsView.vue
    │   │   ├── ProductDetailView.vue
    │   │   ├── CartView.vue
    │   │   ├── CheckoutView.vue
    │   │   ├── MyOrdersView.vue
    │   │   ├── OrderDetailView.vue
    │   │   ├── LoginView.vue
    │   │   ├── RegisterView.vue
    │   │   └── admin/
    │   │       ├── AdminLayout.vue
    │   │       ├── DashboardView.vue
    │   │       ├── ProductsView.vue
    │   │       ├── ProductFormView.vue
    │   │       └── OrdersView.vue
    │   ├── stores/
    │   │   ├── auth.js
    │   │   └── cart.js
    │   ├── router/
    │   │   └── index.js
    │   ├── services/
    │   │   └── api.js
    │   └── assets/
    │       └── main.css
    ├── .env.example
    ├── index.html
    └── package.json
```

---

## Order Flow

```
Customer                    Backend                     Third Party
   │                           │                             │
   │── Add to cart ──────────▶ │                             │
   │                           │                             │
   │── POST /api/orders ──────▶│── createSnapTransaction ──▶ Midtrans
   │                           │◀─ { token, redirect_url } ──│
   │◀─ { snapToken } ──────────│                             │
   │                           │                             │
   │── snap.pay(token) ───────▶│                             │
   │                           │                             Midtrans Snap
   │                           │◀── POST /midtrans-notification ◀── (on payment)
   │                           │                             │
   │                           │── verifyNotification() ──▶ Midtrans
   │                           │── deduct stock             │
   │                           │── createShippingOrder ───▶ Biteship
   │                           │── status: processing       │
   │                           │                             │
   │── GET /orders/:number ───▶│                             │
   │◀─ { status: processing } ─│                             │
```

---

## Deployment

### Backend — Railway / Render

```bash
# Set these environment variables in your dashboard:
NODE_ENV=production
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-xxxxx    # Production key (no SB- prefix)
MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
MONGO_URI=mongodb+srv://...             # MongoDB Atlas URI
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend — Vercel / Netlify

```bash
# Build command
npm run build

# Output directory
dist/

# Environment variables
VITE_API_URL=https://your-backend.railway.app/api
VITE_MIDTRANS_CLIENT_KEY=Mid-client-xxxxx
```

Also update `index.html` Snap.js script src to production URL:
```
https://app.midtrans.com/snap/snap.js
```

---

## Troubleshooting

**Snap is not defined**
Make sure `data-client-key` in `index.html` is filled correctly and reload the browser completely.

**Webhook not receiving**
Verify ngrok is running, the tunnel URL in Midtrans dashboard is correct, and has no trailing slash.

**Biteship rates empty**
Check that `STORE_ORIGIN_AREA_ID` is valid. You can discover it by calling `/api/shipping/areas?query=cikarang` and copying the `id` field.

**MongoDB connection refused**
Confirm your MongoDB service is running. If using Laragon, start the MongoDB service from the Laragon control panel.

---

## Roadmap

- [ ] Image upload to Cloudinary (currently URL-based)
- [ ] Order cancellation flow by customer
- [ ] Push notifications for order status changes
- [ ] Product review and rating system
- [ ] Discount voucher / promo code system
- [ ] Export sales report to Excel / PDF
- [ ] WhatsApp order notification integration

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# then open a Pull Request
```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

<!-- Animated footer -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:ffd60a,50:0066ff,100:1a1a2e&height=120&section=footer" width="100%"/>

<!-- Profile link -->
[![GitHub](https://img.shields.io/badge/GitHub-Theikol-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Theikol)

**Adrian Haikal** · Indonesia

*Built with passion for the Indonesian tech community*

![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=Theikol.dchal-store)

</div>