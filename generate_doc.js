const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');

// ── colour palette ──────────────────────────────────────────────────
const ACCENT   = "A8CC00";  // ShopAura yellow-green
const DARK     = "0D0D0F";  // brand dark
const MID      = "2A2A2E";  // border grey
const MUTED    = "888888";
const WHITE    = "FFFFFF";
const BLACK    = "000000";
const LIGHT_BG = "F4F9E8";  // very light tint

// ── helpers ─────────────────────────────────────────────────────────
function sp(before = 0, after = 0) {
  return { spacing: { before, after } };
}

function rule(color = MID, size = 6) {
  return { bottom: { style: BorderStyle.SINGLE, size, color, space: 1 } };
}

function hr(color = MID) {
  return new Paragraph({ border: rule(color, 4), children: [], ...sp(0, 160) });
}

function accentBar() {
  return new Paragraph({ border: rule(ACCENT, 12), children: [], ...sp(0, 200) });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: DARK })],
    border: rule(ACCENT, 8),
    ...sp(360, 200),
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: "333333" })],
    ...sp(280, 120),
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, color: "333333", ...opts })],
    ...sp(80, 80),
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: "333333", bold })],
    ...sp(60, 60),
  });
}

function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: "333333" })],
    ...sp(60, 60),
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "1a1a2e" })],
    shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
    indent: { left: 360 },
    ...sp(60, 60),
  });
}

function blankLine() {
  return new Paragraph({ children: [] });
}

// ── cell builder ────────────────────────────────────────────────────
function cell(text, w, { bg = WHITE, bold = false, center = false, header = false } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 150, right: 150 },
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({
        text, font: "Arial",
        size: header ? 20 : 20,
        bold: bold || header,
        color: header ? WHITE : "333333",
      })],
    })],
  });
}

function tableHeaderRow(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => cell(c, widths[i], { bg: "2A2A2E", header: true, center: true })),
  });
}

function tableRow(cols, widths, even = false) {
  const bg = even ? "F9F9F9" : WHITE;
  return new TableRow({
    children: cols.map((c, i) => cell(c, widths[i], { bg })),
  });
}

// ────────────────────────────────────────────────────────────────────
//  DOCUMENT
// ────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 320 } } } }],
      },
      {
        reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 320 } } } }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "222222" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [
    // ── COVER PAGE ────────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        blankLine(), blankLine(), blankLine(),

        // Logo badge + Brand name
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "HV", font: "Arial", size: 64, bold: true, color: BLACK,
              highlight: "yellow" }),
          ],
          ...sp(0, 200),
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Shop", font: "Arial", size: 80, bold: true, color: DARK }),
            new TextRun({ text: "Aura", font: "Arial", size: 80, bold: true, color: ACCENT }),
          ],
          ...sp(0, 80),
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "E-Commerce Platform", font: "Arial", size: 28, color: MUTED, italics: true })],
          ...sp(0, 600),
        }),

        accentBar(),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "INTERNSHIP PROJECT REPORT", font: "Arial", size: 32, bold: true, color: DARK, allCaps: true })],
          ...sp(400, 200),
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Task 1 — Simple E-Commerce Store", font: "Arial", size: 28, color: "444444" })],
          ...sp(0, 600),
        }),

        accentBar(),

        blankLine(), blankLine(),

        // Details table
        new Table({
          width: { size: 6000, type: WidthType.DXA },
          columnWidths: [2200, 3800],
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({ children: [
              cell("Submitted To",  2200, { bold: true, bg: LIGHT_BG }),
              cell("CodeAlpha",     3800),
            ]}),
            new TableRow({ children: [
              cell("Submitted By",  2200, { bold: true, bg: LIGHT_BG }),
              cell("Sushma Annam",  3800),
            ]}),
            new TableRow({ children: [
              cell("Email",         2200, { bold: true, bg: LIGHT_BG }),
              cell("sushma.annam.555@gmail.com", 3800),
            ]}),
            new TableRow({ children: [
              cell("Project Name",  2200, { bold: true, bg: LIGHT_BG }),
              cell("ShopAura",      3800),
            ]}),
            new TableRow({ children: [
              cell("Technology",    2200, { bold: true, bg: LIGHT_BG }),
              cell("Node.js  |  Express.js  |  MongoDB  |  Vanilla JS", 3800),
            ]}),
            new TableRow({ children: [
              cell("Date",          2200, { bold: true, bg: LIGHT_BG }),
              cell("June 2025",     3800),
            ]}),
          ],
        }),

        blankLine(), blankLine(), blankLine(), blankLine(),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ── MAIN CONTENT ────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1260, right: 1260, bottom: 1260, left: 1260 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: rule(ACCENT, 8),
              children: [
                new TextRun({ text: "ShopAura  |  CodeAlpha Internship Project", font: "Arial", size: 18, color: MUTED }),
                new TextRun({ text: "   Task 1 — E-Commerce Store", font: "Arial", size: 18, color: MUTED, italics: true }),
              ],
              ...sp(0, 120),
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: MID, space: 1 } },
              children: [
                new TextRun({ text: "ShopAura — CodeAlpha Internship Report  |  ", font: "Arial", size: 16, color: MUTED }),
                new TextRun({ text: "Page ", font: "Arial", size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: MUTED }),
              ],
              alignment: AlignmentType.CENTER,
              ...sp(80, 0),
            }),
          ],
        }),
      },
      children: [

        // ── 1. INTRODUCTION ────────────────────────────────────
        heading1("1.  Introduction"),
        body("ShopAura is a full-stack e-commerce web application built as Task 1 of the CodeAlpha Software Development Internship. The goal was to design and develop a fully functional online shopping platform covering all core e-commerce features — from product browsing to order placement."),
        blankLine(),
        body("This project demonstrates real-world application of:"),
        bullet("Backend API development using Node.js and Express.js"),
        bullet("NoSQL database design and querying with MongoDB"),
        bullet("Session-based authentication and authorisation"),
        bullet("Responsive single-page frontend using HTML, CSS, and JavaScript"),
        bullet("Full CRUD operations for products, users, and orders"),
        blankLine(),

        // ── 2. REQUIREMENTS ────────────────────────────────────
        heading1("2.  Project Requirements"),
        body("The following requirements were provided by CodeAlpha for Task 1:"),
        blankLine(),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [600, 3360, 5400],
          rows: [
            tableHeaderRow(["#", "Requirement", "Implementation Status"], [600, 3360, 5400]),
            tableRow(["1", "Product listings page", "Implemented — grid layout with search, filter, sort"], [600, 3360, 5400], false),
            tableRow(["2", "Shopping cart", "Implemented — localStorage-backed, persistent"], [600, 3360, 5400], true),
            tableRow(["3", "Product details page", "Implemented — dedicated detail view with quantity control"], [600, 3360, 5400], false),
            tableRow(["4", "Order processing", "Implemented — checkout form, order API, stock deduction"], [600, 3360, 5400], true),
            tableRow(["5", "User registration / login", "Implemented — bcrypt hashing, session-based auth"], [600, 3360, 5400], false),
            tableRow(["6", "Database for products, users, orders", "Implemented — MongoDB with Mongoose ODM"], [600, 3360, 5400], true),
            tableRow(["7", "Frontend: HTML, CSS, JavaScript", "Implemented — vanilla JS SPA with modern dark UI"], [600, 3360, 5400], false),
            tableRow(["8", "Backend: Node.js / Express.js", "Implemented — RESTful API on Express 4.18"], [600, 3360, 5400], true),
          ],
        }),
        blankLine(),

        // ── 3. TECH STACK ──────────────────────────────────────
        heading1("3.  Technology Stack"),
        blankLine(),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 3160, 4000],
          rows: [
            tableHeaderRow(["Layer", "Technology", "Purpose"], [2200, 3160, 4000]),
            tableRow(["Frontend",  "HTML5, CSS3, Vanilla JS", "Single-page application UI"], [2200, 3160, 4000], false),
            tableRow(["Backend",   "Node.js v24 + Express.js 4.18", "RESTful API server"], [2200, 3160, 4000], true),
            tableRow(["Database",  "MongoDB 8.3 + Mongoose 8.0", "Data persistence & schema validation"], [2200, 3160, 4000], false),
            tableRow(["Auth",      "express-session + bcryptjs", "Secure password hashing & sessions"], [2200, 3160, 4000], true),
            tableRow(["Fonts",     "Syne + DM Sans (Google Fonts)", "Typography"], [2200, 3160, 4000], false),
            tableRow(["Images",    "Unsplash CDN", "High-quality product photography"], [2200, 3160, 4000], true),
            tableRow(["Dev Tool",  "Nodemon", "Auto-restart on code change"], [2200, 3160, 4000], false),
          ],
        }),
        blankLine(),

        // ── 4. PROJECT STRUCTURE ───────────────────────────────
        heading1("4.  Project Structure"),
        body("The project follows a clean separation between backend and frontend:"),
        blankLine(),
        code("ecommerce/"),
        code("  backend/"),
        code("    config/"),
        code("      db.js                 MongoDB connection handler"),
        code("    middleware/"),
        code("      auth.js               requireAuth & requireAdmin guards"),
        code("    models/"),
        code("      User.js               User schema (name, email, password, role)"),
        code("      Product.js            Product schema (name, price, category, stock)"),
        code("      Order.js              Order schema (items, address, status)"),
        code("    routes/"),
        code("      auth.js               POST /register  POST /login  GET /me"),
        code("      products.js           CRUD + seed endpoint"),
        code("      orders.js             Place order, view history, admin status update"),
        code("    server.js               Express entry point"),
        code("  frontend/"),
        code("    index.html              Complete SPA (HTML + CSS + JS in one file)"),
        code("  .env                      PORT, MONGO_URI, SESSION_SECRET"),
        code("  package.json"),
        blankLine(),

        // ── 5. FEATURES ────────────────────────────────────────
        heading1("5.  Features Implemented"),

        heading2("5.1  User Authentication"),
        bullet("New user registration with name, email, and password"),
        bullet("Password securely hashed with bcryptjs (10 salt rounds) before saving to database"),
        bullet("Session-based login — user stays logged in until they log out or session expires (7 days)"),
        bullet("Role-based access: 'user' and 'admin' roles with protected API routes"),
        bullet("Modal login/register dialogs with form validation and error feedback"),
        blankLine(),

        heading2("5.2  Product Catalogue"),
        bullet("12 pre-seeded products across 7 categories: Electronics, Clothing, Books, Home, Sports, Beauty, Toys"),
        bullet("One-click category filter pills (e.g. ⚡ Electronics, 📚 Books)"),
        bullet("Real-time search by product name with 400 ms debounce"),
        bullet("Sort by: Newest, Price Low→High, Price High→Low, Top Rated"),
        bullet("Results count displayed in the filter bar"),
        bullet("'NEW' badge on the 3 most recently seeded products"),
        bullet("Wishlist heart button appears on card hover"),
        blankLine(),

        heading2("5.3  Product Detail Page"),
        bullet("Full product image, name, category, star rating, review count, description"),
        bullet("Stock availability badge (In Stock / Only N left / Out of Stock)"),
        bullet("Quantity selector with min/max validation against available stock"),
        bullet("'Add to Cart' and 'Wishlist' action buttons"),
        blankLine(),

        heading2("5.4  Shopping Cart"),
        bullet("Cart persists in browser localStorage — survives page refreshes"),
        bullet("Increase / decrease quantity per item, or remove entirely"),
        bullet("Live running total with 'FREE' shipping highlight"),
        bullet("Cart item count badge on the navbar cart button"),
        blankLine(),

        heading2("5.5  Checkout & Order Processing"),
        bullet("Full shipping address form (name, street, city, state, ZIP, country)"),
        bullet("Payment method selector: Cash on Delivery, UPI, Credit/Debit Card"),
        bullet("Live order summary panel with subtotal and grand total"),
        bullet("On order placement: stock is deducted from the database in real-time"),
        bullet("Order success page with options to view orders or continue shopping"),
        blankLine(),

        heading2("5.6  Order History"),
        bullet("Authenticated users can view all their past orders"),
        bullet("Each order card shows: Order ID, date, items, payment method, delivery city, total"),
        bullet("Status badges with colour coding: Pending (orange), Processing (blue), Shipped (purple), Delivered (green), Cancelled (red)"),
        blankLine(),

        heading2("5.7  User Interface & Design"),
        bullet("Dark theme with brand accent colour #A8CC00 (yellow-green)"),
        bullet("'HV' logo badge in the navbar and footer with gradient background"),
        bullet("Trust bar on the home page: Free Delivery, Easy Returns, Secure Payments, Top Rated"),
        bullet("Stats banner: 500+ Products, 10K+ Customers, 7 Categories, Free Shipping"),
        bullet("Full 4-column footer with Shop, Account, and Support link sections"),
        bullet("Responsive grid layout — works on desktop, tablet, and mobile"),
        bullet("Smooth hover animations: card lift, image zoom, overlay gradient"),
        bullet("Toast notification system (bottom-right) for all user actions"),
        blankLine(),

        // ── 6. API ENDPOINTS ───────────────────────────────────
        heading1("6.  API Endpoints"),

        heading2("6.1  Authentication  (/api/auth)"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1000, 2200, 3560, 2600],
          rows: [
            tableHeaderRow(["Method", "Endpoint", "Description", "Auth Required"], [1000, 2200, 3560, 2600]),
            tableRow(["POST", "/api/auth/register", "Create new user account", "No"], [1000, 2200, 3560, 2600], false),
            tableRow(["POST", "/api/auth/login",    "Login with email & password", "No"], [1000, 2200, 3560, 2600], true),
            tableRow(["POST", "/api/auth/logout",   "Destroy session & log out", "Yes"], [1000, 2200, 3560, 2600], false),
            tableRow(["GET",  "/api/auth/me",       "Get current logged-in user", "Yes"], [1000, 2200, 3560, 2600], true),
          ],
        }),
        blankLine(),

        heading2("6.2  Products  (/api/products)"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1000, 2800, 3560, 2000],
          rows: [
            tableHeaderRow(["Method", "Endpoint", "Description", "Auth Required"], [1000, 2800, 3560, 2000]),
            tableRow(["GET",    "/api/products",          "List all (with filters, sort, pagination)", "No"],    [1000, 2800, 3560, 2000], false),
            tableRow(["GET",    "/api/products/:id",      "Get single product by ID", "No"],                    [1000, 2800, 3560, 2000], true),
            tableRow(["POST",   "/api/products",          "Create new product", "Admin only"],                  [1000, 2800, 3560, 2000], false),
            tableRow(["PUT",    "/api/products/:id",      "Update product details", "Admin only"],              [1000, 2800, 3560, 2000], true),
            tableRow(["DELETE", "/api/products/:id",      "Delete a product", "Admin only"],                   [1000, 2800, 3560, 2000], false),
            tableRow(["POST",   "/api/products/seed/run", "Load 12 sample products", "No"],                    [1000, 2800, 3560, 2000], true),
          ],
        }),
        blankLine(),

        heading2("6.3  Orders  (/api/orders)"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1000, 2800, 3560, 2000],
          rows: [
            tableHeaderRow(["Method", "Endpoint", "Description", "Auth Required"], [1000, 2800, 3560, 2000]),
            tableRow(["POST", "/api/orders",            "Place a new order", "User"],         [1000, 2800, 3560, 2000], false),
            tableRow(["GET",  "/api/orders/my",         "Get current user's orders", "User"], [1000, 2800, 3560, 2000], true),
            tableRow(["GET",  "/api/orders/:id",        "Get single order by ID", "User"],    [1000, 2800, 3560, 2000], false),
            tableRow(["GET",  "/api/orders",            "Get all orders", "Admin only"],      [1000, 2800, 3560, 2000], true),
            tableRow(["PUT",  "/api/orders/:id/status", "Update order status", "Admin only"], [1000, 2800, 3560, 2000], false),
          ],
        }),
        blankLine(),

        // ── 7. DATABASE DESIGN ─────────────────────────────────
        heading1("7.  Database Design"),

        heading2("7.1  User Collection"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 2160, 2000, 3000],
          rows: [
            tableHeaderRow(["Field", "Type", "Required", "Notes"], [2200, 2160, 2000, 3000]),
            tableRow(["name",      "String",   "Yes", "Trimmed"], [2200, 2160, 2000, 3000], false),
            tableRow(["email",     "String",   "Yes", "Unique, lowercase"], [2200, 2160, 2000, 3000], true),
            tableRow(["password",  "String",   "Yes", "Bcrypt hashed, min 6 chars"], [2200, 2160, 2000, 3000], false),
            tableRow(["role",      "String",   "No",  "Enum: 'user' | 'admin', default 'user'"], [2200, 2160, 2000, 3000], true),
            tableRow(["address",   "Object",   "No",  "street, city, state, zip, country"], [2200, 2160, 2000, 3000], false),
            tableRow(["timestamps","auto",     "-",   "createdAt, updatedAt"], [2200, 2160, 2000, 3000], true),
          ],
        }),
        blankLine(),

        heading2("7.2  Product Collection"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 2160, 2000, 3000],
          rows: [
            tableHeaderRow(["Field", "Type", "Required", "Notes"], [2200, 2160, 2000, 3000]),
            tableRow(["name",        "String",  "Yes", "Product title"], [2200, 2160, 2000, 3000], false),
            tableRow(["description", "String",  "Yes", "Full description text"], [2200, 2160, 2000, 3000], true),
            tableRow(["price",       "Number",  "Yes", "Min 0"], [2200, 2160, 2000, 3000], false),
            tableRow(["category",    "String",  "Yes", "Enum: Electronics, Clothing, Books..."], [2200, 2160, 2000, 3000], true),
            tableRow(["stock",       "Number",  "No",  "Default 0, min 0"], [2200, 2160, 2000, 3000], false),
            tableRow(["image",       "String",  "No",  "URL to product image"], [2200, 2160, 2000, 3000], true),
            tableRow(["rating",      "Number",  "No",  "0–5 scale"], [2200, 2160, 2000, 3000], false),
            tableRow(["numReviews",  "Number",  "No",  "Review count"], [2200, 2160, 2000, 3000], true),
          ],
        }),
        blankLine(),

        heading2("7.3  Order Collection"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 2160, 2000, 3000],
          rows: [
            tableHeaderRow(["Field", "Type", "Required", "Notes"], [2200, 2160, 2000, 3000]),
            tableRow(["user",            "ObjectId", "Yes", "Ref to User"], [2200, 2160, 2000, 3000], false),
            tableRow(["items",           "Array",    "Yes", "Each: product ref, name, price, qty, image"], [2200, 2160, 2000, 3000], true),
            tableRow(["shippingAddress", "Object",   "Yes", "street, city, state, zip, country"], [2200, 2160, 2000, 3000], false),
            tableRow(["totalPrice",      "Number",   "Yes", "Calculated server-side"], [2200, 2160, 2000, 3000], true),
            tableRow(["status",          "String",   "No",  "pending|processing|shipped|delivered|cancelled"], [2200, 2160, 2000, 3000], false),
            tableRow(["paymentMethod",   "String",   "No",  "COD | UPI | Card, default COD"], [2200, 2160, 2000, 3000], true),
          ],
        }),
        blankLine(),

        // ── 8. HOW TO RUN ──────────────────────────────────────
        heading1("8.  How to Run the Project"),
        body("Follow these steps to set up and run ShopAura on a local machine:"),
        blankLine(),

        heading2("Prerequisites"),
        bullet("Node.js v18 or later  (download from nodejs.org)"),
        bullet("MongoDB Community Server  (download from mongodb.com)"),
        bullet("MongoDB must be running as a Windows service"),
        blankLine(),

        heading2("Step-by-Step Setup"),
        numbered("Open Command Prompt and navigate to the project folder:"),
        code("   cd C:\\IntershipProjects\\CodeAlpha_EcommerceStore\\ecommerce"),
        blankLine(),
        numbered("Install all Node.js dependencies:"),
        code("   npm install"),
        blankLine(),
        numbered("Start the application:"),
        code("   npm start"),
        blankLine(),
        numbered("You should see these two lines in the terminal:"),
        code("   Server running on http://localhost:5000"),
        code("   MongoDB Connected: localhost"),
        blankLine(),
        numbered("Open your browser and go to:"),
        code("   http://localhost:5000"),
        blankLine(),
        numbered("Load the 12 sample products by visiting:"),
        code("   http://localhost:5000/api/products/seed/run  (POST via browser or Postman)"),
        blankLine(),

        // ── 9. KEY LEARNINGS ───────────────────────────────────
        heading1("9.  Key Learnings"),
        body("This project helped me understand and apply the following real-world concepts:"),
        blankLine(),
        bullet("How a full-stack web application is structured — separating frontend, backend, and database concerns"),
        bullet("How Express.js routes work — handling HTTP methods (GET, POST, PUT, DELETE) for a REST API"),
        bullet("How MongoDB stores data in collections (like tables in SQL), and how Mongoose adds structure with schemas"),
        bullet("Why passwords should never be stored as plain text — bcrypt hashing ensures security even if the database is compromised"),
        bullet("How sessions work — the server stores who is logged in and the browser sends a cookie to prove identity"),
        bullet("How JavaScript fetch() is used on the frontend to communicate with the backend API"),
        bullet("How localStorage can persist data (like a shopping cart) on the browser without needing a database"),
        bullet("How CSS variables, flexbox, and grid make responsive layouts manageable"),
        blankLine(),

        // ── 10. CONCLUSION ────────────────────────────────────
        heading1("10.  Conclusion"),
        body("ShopAura successfully meets all the requirements set by CodeAlpha for Task 1. It is a fully functional, responsive, and visually polished e-commerce platform built using industry-standard technologies."),
        blankLine(),
        body("The project covers every layer of a real web application — from database models and secure authentication, to a clean API and a modern frontend UI. It demonstrates how Node.js, Express.js, and MongoDB work together to build production-quality web software."),
        blankLine(),
        body("The experience gained through this project — including debugging, iterative improvement, and learning a new tech stack — has been invaluable in building practical software engineering skills."),
        blankLine(),
        blankLine(),
        hr(),
        blankLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "ShopAura  |  CodeAlpha Task 1  |  June 2025", font: "Arial", size: 18, color: MUTED, italics: true }),
          ],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("ShopAura_Internship_Report.docx", buffer);
  console.log("Document created: ShopAura_Internship_Report.docx");
});
