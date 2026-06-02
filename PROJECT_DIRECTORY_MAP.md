# 🌿 Luxury Scent Decants — Architecture & Directory Map

This guide documents the layout, architecture, and module responsibilities of the Luxury Scent Decants unified application. The system integrates a React/Vite storefront and administrator console with a Laravel PHP REST API using a local SQLite database.

---

## 📂 Root Directory Architecture

```
Luxury Scent Decants/
├── app/                          # BACKEND: Core API & Business Logic
├── bootstrap/                    # BACKEND: Framework Bootstrap & Cache
├── config/                       # CONFIGURATION: System Settings (DB, Mail, App)
├── database/                     # STORAGE & MIGRATIONS: SQLite DB & Seeders
├── storefront-and-admin-portal/  # FRONTEND: Storefront & Admin Portal (React + Vite)
├── public/                       # WEBROOT: Public Entry point & Uploads
├── resources/                    # BACKEND RESOURCES: Static assets & blade files
├── routes/                       # ROUTING: API Endpoints (api.php)
├── storage/                      # SYSTEM STORAGE: Logs, sessions, & file uploads
└── tests/                        # AUTOMATED TESTING: Unit & Integration tests
```

---

## 🖥️ Frontend Architecture (`storefront-and-admin-portal/`)

The user interface is built using React, Vite, Tailwind CSS, and Framer Motion. It houses both the customer-facing storefront and the secure administrator dashboard in a single page application (SPA) system.

```
storefront-and-admin-portal/
├── public/                       # Static public assets (logos, marble textures)
└── src/
    ├── admin/                    # ADMIN DASHBOARD PORTAL
    │   ├── AdminLayout.jsx       # Layout containing sidebar and tab state
    │   ├── Catalog.jsx           # Manage products, uploads, prices, decant volumes
    │   ├── Dashboard.jsx         # Sales dashboard, stats metrics, visual indicators
    │   ├── Inquiries.jsx         # Order ledger, status manager, waybill print & download
    │   └── Login.jsx             # Secure administrator session authorization gate
    │
    ├── components/               # CUSTOMER STOREFRONT LAYOUT & SECTIONS
    │   ├── AuthModal.jsx         # Guest/User sign-in & enrollment popup
    │   ├── AuthenticityProcess.jsx# Scent decanting premium quality verification sequence
    │   ├── BrandStory.jsx        # Premium luxury heritage messaging display
    │   ├── FAQ.jsx               # Breathtaking interactive shopping inquiry FAQ accordion
    │   ├── Footer.jsx            # Elegant bottom panel with luxury navigation links
    │   ├── Hero.jsx              # Immersive call-to-action landing header
    │   ├── InquiryBag.jsx        # Side drawer shopping cart with live total calculations
    │   ├── InquiryForm.jsx       # Interactive checkout form with COD, E-wallet, & RCBC
    │   ├── Navbar.jsx            # Dynamic navigation bar with active admin portal toggle
    │   ├── Preloader.jsx         # High-end gold-shimmer animated loading introduction
    │   ├── ProductCard.jsx       # Card representation of single fragrance, size, & price
    │   ├── ProductModal.jsx      # Detailed note selector, sizes, and cart addition modal
    │   ├── ProductShowcase.jsx   # Scent browsing grid with advanced filtering & catalog search
    │   └── UserProfile.jsx       # Personal user dashboard, inquiry history & invoice printing
    │
    ├── contexts/                 # APPLICATION CONTEXTS
    │   ├── AuthContext.jsx       # User credentials status & global login/logout state
    │   └── CartContext.jsx       # Shopping cart operations (add, edit quantities, clear)
    │
    ├── data/                     # STATIC CONFIGS
    │   └── brands.js             # List of premium designer brands & catalog resources
    │
    └── lib/                      # CLIENT HELPERS
        └── api.js                # Custom Axios instance with credentials injection
```

---

## ⚙️ Backend REST API Architecture (`app/`)

The API is powered by Laravel 11. It provides secure CRUD services, validation controls, and administrative management.

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── V1/
│   │           ├── AdminController.php   # Dashboard status calculations & summaries
│   │           ├── AuthController.php    # API user registration & Sanctum token issuer
│   │           ├── InquiryController.php # Customer order submission & tracking REST actions
│   │           └── ProductController.php # Fragrance catalog browsing, brands, & search
│   │
│   └── Middleware/
│       └── AdminMiddleware.php           # Security gate checking for administrative flags
│
├── Models/
│   ├── Inquiry.php                       # Order tracking, reference numbers, user relations
│   ├── InquiryItem.php                   # Itemized orders specifying perfume, sizes, units
│   ├── Product.php                       # Fragrance name, brand, decanting descriptions
│   ├── User.php                          # Customer/Admin profiles, hashing, permissions
│   └── VolumePricing.php                 # Relational pricing tables connecting sizes and cost
│
└── Services/
    └── InquiryService.php                # Decant availability calculations & transaction locks
```

---

## 🛢️ Database & Local Storage Architecture (`database/`)

Stores orders, customer sessions, and products inside a single local file for local execution simplicity.

```
database/
├── database.sqlite               # Local database file storing all active instances
├── factories/                    # Mock model builders for system testing
├── migrations/                   # SQL tables schema definitions (Inquiries, Products, etc.)
└── seeders/                      # Perfume catalogs & administrator initializer
```

---

## ⚙️ Direct Running Scripts & Operations

For simplicity, developer tasks can be executed directly from the root workspace using standard Node.js prefixes:

* Run development environment: `npm run dev`
* Build storefront for production: `npm run build`
* Start local database/API serve: `php artisan serve`
