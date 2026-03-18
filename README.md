<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens" alt="JWT" />
  <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge" alt="License" />
</p>

<h1 align="center">🍕 Food Ordering System</h1>

<p align="center">
  <strong>A full-stack food ordering platform with Role-Based Access Control (RBAC) and country-scoped data isolation.</strong>
</p>

<p align="center">
  Built with <strong>Next.js 15 App Router</strong>, <strong>MongoDB</strong>, and <strong>JWT authentication</strong> — a single, unified codebase serving both the API and the UI.
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure login & registration with hashed passwords (bcrypt, 12 rounds) and 7-day token expiry |
| 🛡️ **Role-Based Access Control** | Three roles — `admin`, `manager`, `member` — each with granular permissions |
| 🌍 **Country-Scoped Data** | Users only see restaurants, menus, and orders from their own country (`india` / `america`) |
| 🍽️ **Restaurant & Menu Management** | Browse restaurants and their categorized menus (starters, mains, desserts, beverages, sides) |
| 🛒 **Order Lifecycle** | Full order flow — create → checkout → payment update → cancel, all permission-gated |
| 🎨 **Modern UI** | Polished, responsive dashboard with Inter font, dark/glassmorphism-inspired design |
| 🌱 **Database Seeding** | One-command seeder populates users, restaurants, and menu items for instant demo |

---

## 🛡️ RBAC Permission Matrix

| Permission | Admin | Manager | Member |
|:---|:---:|:---:|:---:|
| View restaurants & menus | ✅ | ✅ | ✅ |
| Create orders | ✅ | ✅ | ✅ |
| Checkout orders | ✅ | ✅ | ❌ |
| Cancel orders | ✅ | ✅ | ❌ |
| Update payment method | ✅ | ❌ | ❌ |

---

## 📁 Project Structure

```
food-ordering-system/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js          # POST — user login
│   │   │   └── register/route.js       # POST — user registration
│   │   ├── health/route.js             # GET  — health check
│   │   ├── orders/
│   │   │   ├── route.js                # GET/POST — list & create orders
│   │   │   └── [id]/
│   │   │       ├── cancel/route.js     # POST — cancel an order
│   │   │       ├── checkout/route.js   # POST — checkout an order
│   │   │       └── payment/route.js    # PUT  — update payment method
│   │   └── restaurants/
│   │       ├── route.js                # GET  — list restaurants (country-scoped)
│   │       └── [id]/menu/route.js      # GET  — get restaurant menu items
│   ├── dashboard/page.js               # Dashboard UI (restaurants, ordering, orders)
│   ├── page.js                         # Login / Register page
│   ├── layout.js                       # Root layout
│   └── globals.css                     # Global styles
├── lib/
│   ├── auth.js                         # JWT sign & authenticate middleware
│   ├── rbac.js                         # Permission authorization & country filter
│   ├── roles.js                        # Roles, countries & permissions config
│   ├── response.js                     # Standardized JSON response helpers
│   ├── db.js                           # Cached MongoDB connection (Mongoose)
│   ├── client/
│   │   └── api.js                      # Client-side fetch wrapper & auth helpers
│   └── models/
│       ├── User.js                     # User model (name, email, password, role, country)
│       ├── Restaurant.js               # Restaurant model (name, address, cuisine, country)
│       ├── MenuItem.js                 # Menu item model (name, price, category, restaurant)
│       └── Order.js                    # Order model (items, status, payment, total)
├── scripts/
│   └── seed.js                         # Database seeder (users, restaurants, menus)
├── package.json
├── next.config.js
└── .env.local                          # Environment variables (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 1. Clone the Repository

```bash
git clone https://github.com/Nishwan-Kumar/Food-Ordering-System.git
cd Food-Ordering-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/food-ordering?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

| Variable | Description | Default |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | *required* |
| `JWT_SECRET` | Secret key for signing JWTs | *required* |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |

### 4. Seed the Database

```bash
npm run seed
```

This creates **6 test users**, **4 restaurants**, and **8 menu items** across two countries.

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Test Credentials

All test users share the same password: **`password123`**

| Role | Country | Email |
|---|---|---|
| Admin | India 🇮🇳 | `admin.india@test.com` |
| Manager | India 🇮🇳 | `manager.india@test.com` |
| Member | India 🇮🇳 | `member.india@test.com` |
| Admin | America 🇺🇸 | `admin.america@test.com` |
| Manager | America 🇺🇸 | `manager.america@test.com` |
| Member | America 🇺🇸 | `member.america@test.com` |

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require a `Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login & receive JWT |

### Restaurants

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/restaurants` | ✅ | List restaurants (user's country) |
| `GET` | `/api/restaurants/:id/menu` | ✅ | Get menu items for a restaurant |

### Orders

| Method | Endpoint | Auth | Permission | Description |
|---|---|---|---|---|
| `GET` | `/api/orders` | ✅ | All roles | List user's orders |
| `POST` | `/api/orders` | ✅ | All roles | Create a new order |
| `POST` | `/api/orders/:id/checkout` | ✅ | Admin, Manager | Confirm an order |
| `POST` | `/api/orders/:id/cancel` | ✅ | Admin, Manager | Cancel an order |
| `PUT` | `/api/orders/:id/payment` | ✅ | Admin only | Update payment method |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | ❌ | Server health check |

---

## 🗃️ Data Models

### User
```
name · email · password (hashed) · role (admin|manager|member) · country (india|america)
```

### Restaurant
```
name · address · cuisine · country · isActive
```

### MenuItem
```
name · description · price · category (starter|main|dessert|beverage|side) · restaurant (ref) · country · isAvailable
```

### Order
```
user (ref) · restaurant (ref) · items[] { menuItem, name, quantity, price } · country · status (pending|confirmed|cancelled) · paymentMethod (cash|card|upi) · totalAmount
```

---

## 🏗️ Architecture Highlights

- **Next.js App Router** — API routes (`route.js`) and pages co-located in the `app/` directory
- **Serverless-Ready** — Cached Mongoose connection reused across invocations via `global._mongooseCache`
- **Structured Error Handling** — Auth & RBAC helpers throw `{ status, message }` objects caught by a unified `errorResponse()` helper
- **Client-Side Auth** — JWT stored in `localStorage` and auto-attached to every API call via the `api()` wrapper
- **Country Isolation** — `countryFilter()` ensures users can only access data scoped to their own country

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create an optimized production build |
| `npm start` | Start the production server |
| `npm run seed` | Seed the database with sample data |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/) |
| Auth | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| Styling | Vanilla CSS with CSS custom properties |
| Font | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

---

## 📄 License

This project is **private** and not licensed for public distribution.

---

<p align="center">
  Built with ❤️ using Next.js & MongoDB
</p>
