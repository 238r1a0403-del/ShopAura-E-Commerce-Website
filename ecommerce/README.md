# 🛍️ ShopNova — CodeAlpha Task 1: E-commerce Store

A full-stack e-commerce web application built with **Node.js + Express.js** (backend) and **HTML/CSS/JavaScript** (frontend), using **MongoDB** as the database.

---

## 📁 Project Structure

```
CodeAlpha_EcommerceStore/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # Auth middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Product.js         # Product schema
│   │   └── Order.js           # Order schema
│   ├── routes/
│   │   ├── auth.js            # Register, Login, Logout
│   │   ├── products.js        # Product CRUD + Seeder
│   │   └── orders.js          # Order management
│   └── server.js              # Express entry point
├── frontend/
│   └── index.html             # Complete single-page frontend
├── .env                       # Environment variables
├── package.json
└── README.md
```

---

## ✅ Features Implemented

- **User Registration & Login** (with bcrypt password hashing + session auth)
- **Product Listings** with search, filter by category, sort by price/rating
- **Product Detail Page** with quantity selector and stock info
- **Shopping Cart** (persistent via localStorage)
- **Order Placement** with shipping address form
- **My Orders** page with order status tracking
- **Admin-only** product management endpoints
- **12 Sample Products** auto-seeder across 7 categories
- **Responsive Design** — works on mobile and desktop

---

## 🛠️ Step-by-Step Setup Guide

### STEP 1 — Install Node.js

1. Go to: **https://nodejs.org**
2. Download the **LTS version** (e.g. 20.x)
3. Run the installer — keep all defaults, click Next → Install
4. After installation, open **Command Prompt** and verify:
   ```
   node --version
   npm --version
   ```
   Both should show a version number.

---

### STEP 2 — Install MongoDB

1. Go to: **https://www.mongodb.com/try/download/community**
2. Select:
   - Version: **7.0 (current)**
   - Platform: **Windows**
   - Package: **MSI**
3. Download and run the installer
4. During setup:
   - Choose **"Complete"** installation
   - Check ✅ **"Install MongoDB as a Service"** (starts automatically)
   - Check ✅ **"Install MongoDB Compass"** (optional GUI tool)
5. After installation, MongoDB runs automatically in the background.

> **Verify MongoDB is running:** Open Command Prompt and run:
> ```
> mongosh
> ```
> You should see a MongoDB shell prompt. Type `exit` to leave.

---

### STEP 3 — Set Up the Project

1. **Rename the project folder** to `CodeAlpha_EcommerceStore`

2. **Open Command Prompt inside the project folder:**
   - Hold `Shift` + Right-click inside the folder
   - Select "Open PowerShell window here" or "Open Command window here"

3. **Install dependencies:**
   ```
   npm install
   ```
   Wait for it to finish (downloads Express, Mongoose, bcrypt, etc.)

---

### STEP 4 — Start the Server

```
npm start
```

You should see:
```
MongoDB Connected: localhost
🚀 Server running on http://localhost:5000
📦 CodeAlpha E-commerce Store
```

---

### STEP 5 — Seed Sample Products

Open a **new browser tab** and go to:
```
http://localhost:5000/api/products/seed/run
```

Or open a new Command Prompt and run:
```
curl -X POST http://localhost:5000/api/products/seed/run
```

This loads **12 sample products** into the database.

---

### STEP 6 — Open the App

Go to: **http://localhost:5000**

You can now:
- Browse all 12 products
- Register a new account
- Add products to cart
- Place an order
- View your order history

---

## 🔑 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| POST | /api/auth/logout | Sign out |
| GET | /api/auth/me | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all (with filters) |
| GET | /api/products/:id | Single product |
| POST | /api/products | Add product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |
| POST | /api/products/seed/run | Seed sample data |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order (auth) |
| GET | /api/orders/my | My orders (auth) |
| GET | /api/orders/:id | Single order (auth) |
| GET | /api/orders | All orders (admin) |
| PUT | /api/orders/:id/status | Update status (admin) |

---

## 📤 GitHub Upload Instructions

1. Create a new GitHub repository named: `CodeAlpha_EcommerceStore`
2. Initialize git in the project folder:
   ```
   git init
   git add .
   git commit -m "CodeAlpha Task 1 - E-commerce Store"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/CodeAlpha_EcommerceStore.git
   git push -u origin main
   ```

> ⚠️ Add a `.gitignore` file with `node_modules/` and `.env` before pushing!

---

## 🎓 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | express-session + bcryptjs |
| Styling | Custom CSS with CSS Variables |

---

## 👨‍💻 Built for CodeAlpha Full Stack Internship — Task 1
