# 🎁 Gift Mart - E-Commerce Platform

A modern full-stack e-commerce platform for curated gifts with secure payments, real-time order tracking, and admin dashboard.

![GitHub](https://img.shields.io/badge/GitHub-INKARAN001%2FGIFT--MART-blue?logo=github)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-success)

**Repository:** [github.com/INKARAN001/GIFT-MART](https://github.com/INKARAN001/GIFT-MART)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 📖 Overview

**Gift Mart** is a full-stack e-commerce web application designed to provide a seamless shopping experience for curated gift products.

### Problem Statement
Users need a single, unified platform to:
- Discover and browse curated gift products
- Manage shopping cart and wishlist
- Complete secure checkout with transparent pricing
- Track orders in real-time
- Stay engaged through reminders and promotions

### Solution
Gift Mart provides:
- ✅ Complete product catalog with search and filtering
- ✅ Secure Stripe payment integration
- ✅ Real-time order tracking with map visualization
- ✅ Distance-based shipping from a central hub (Jaffna)
- ✅ Event reminders and newsletter management
- ✅ Admin dashboard for inventory and order management
- ✅ User profiles with order history and preferences

---

## ✨ Features

### 👥 User Features
- **Authentication & Security**
  - User registration and login
  - Email verification
  - Password reset flow
  - JWT-based session management

- **Shopping Experience**
  - Browse products by category
  - Full-text search
  - Product filters and sorting
  - Detailed product views with reviews
  - Add to cart / wishlist
  - Stock management

- **Checkout & Payment**
  - Multi-step checkout process
  - Address validation (SL-specific)
  - Distance-based shipping calculation
  - Transparent fee breakdown (merchandise + shipping + 2% fee)
  - Secure Stripe payment integration
  - Order confirmation with invoice

- **Order Tracking**
  - Real-time order status updates
  - Google Maps integration for delivery tracking
  - Order history in user profile
  - Invoice download (PDF)

- **Engagement**
  - Event reminders with email notifications
  - Newsletter subscription
  - Product reviews and ratings
  - Personalized recommendations

### 🛠️ Admin Features
- **Catalog Management**
  - Add/edit/delete products
  - Manage categories
  - Upload product images
  - View product reviews

- **Order Management**
  - View all orders
  - Update order status
  - Track payments
  - Generate reports

- **User Management**
  - View customer profiles
  - Manage user accounts
  - View user activity

- **Analytics** (Optional)
  - Dashboard statistics
  - Order and revenue charts
  - Customer insights

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Styling & layout |
| **Axios** | 1.x | HTTP client |
| **Stripe.js** | 9.x | Payment processing UI |
| **Google Maps API** | Latest | Order tracking & shipping |
| **Swiper** | 12.x | Image carousels |
| **jsPDF** | 4.x | PDF invoice generation |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 17+ | Language |
| **Spring Boot** | 3.2 | Framework |
| **Spring Security** | - | JWT authentication |
| **Spring Data MongoDB** | - | Database ORM |
| **Spring Mail** | - | Email notifications |
| **Stripe Java SDK** | Latest | Payment processing |
| **Maven** | 3.6+ | Dependency management |

### **Database & Services**
| Service | Purpose |
|---------|---------|
| **MongoDB** | NoSQL database (Atlas or local) |
| **Stripe** | Payment processing |
| **Google Maps** | Location & distance calculation |
| **Gmail SMTP** | Email notifications |
| **Render** | Backend hosting (optional) |
| **Vercel** | Frontend hosting (optional) |

---

## 📁 Project Structure

```
GIFT-MART/
├── frontend/                          # React.js Frontend
│   ├── public/
│   │   ├── photos/                   # Product images
│   │   ├── logo.png
│   │   └── placeholder-gift.svg
│   ├── src/
│   │   ├── api/                      # API integration
│   │   ├── components/               # Reusable UI components
│   │   │   ├── home/
│   │   │   ├── product/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ...
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── admin/
│   │   │   └── ...
│   │   ├── config/                   # Configuration
│   │   │   ├── features.js           # Feature flags
│   │   │   └── constants.js
│   │   ├── context/                  # React Context
│   │   ├── styles/                   # Global styles
│   │   ├── utils/                    # Utility functions
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # Entry point
│   ├── .env.example                  # Environment variables template
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend-java/                      # Spring Boot Backend
│   ├── src/main/java/com/giftmart/
│   │   ├── config/                   # Spring configuration
│   │   │   ├── CorsConfig.java
│   │   │   ├── SecurityConfig.java
│   │   │   ├── HttpClientConfig.java
│   │   │   └── ...
│   │   ├── controller/               # API endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── ProductController.java
│   │   │   ├── OrderController.java
│   │   │   ├── AdminController.java
│   │   │   └── ...
│   │   ├── service/                  # Business logic
│   │   │   ├── AuthService.java
│   │   │   ├── OrderService.java
│   │   │   ├── StripePaymentService.java
│   │   │   ├── OrderDeliveryScheduler.java
│   │   │   └── ...
│   │   ├── repository/               # Data access layer
│   │   │   ├── UserRepository.java
│   │   │   ├── ProductRepository.java
│   │   │   ├── OrderRepository.java
│   │   │   └── ...
│   │   ├── document/                 # MongoDB documents
│   │   │   ├── User.java
│   │   │   ├── Product.java
│   │   │   ├── Order.java
│   │   │   └── ...
│   │   ├── dto/                      # Data transfer objects
│   │   ├── security/                 # JWT & security
│   │   │   └── JwtAuthFilter.java
│   │   ├── util/                     # Utilities
│   │   └── GiftMartApplication.java  # Main class
│   ├── src/main/resources/
│   │   ├── application.properties    # Default config
│   │   ├── application-dev.properties
│   │   ├── application-prod.properties
│   │   └── application-local.properties.example
│   ├── pom.xml                       # Maven dependencies
│   ├── Dockerfile                    # Docker configuration
│   ├── mvnw / mvnw.cmd              # Maven wrapper
│   └── README.md
│
├── docs/                              # Project documentation
│   ├── API_ORDERS.md
│   ├── DEMO_SCRIPT.md
│   ├── STRIPE_TESTING.md
│   ├── USER_FLOWS_AND_IMPACT.md
│   └── api.http                      # REST Client requests
│
├── .gitignore
├── README.md                          # This file
├── render.yaml                        # Render deployment config
└── SPRINT_4_PLAN.md                  # Project planning
```

---

## 🔧 Prerequisites

### System Requirements
- **Node.js** 16.x or higher (for frontend)
- **Java** 17 or higher (for backend)
- **Maven** 3.6 or higher (for backend)
- **MongoDB** 5.0+ (local or Atlas cloud)
- **Git** for version control

### Required API Keys
- **Stripe** account (test & production keys)
- **Google Maps** API key (for location features)
- **Gmail** account (for email notifications - optional)

### Recommended Tools
- VS Code with extensions: Prettier, ES7+ React/Redux snippets
- Postman or REST Client for API testing
- MongoDB Compass (MongoDB GUI)

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/INKARAN001/GIFT-MART.git
cd GIFT-MART
```

### 2. Backend Setup (Java/Spring Boot)

```bash
cd backend-java

# Copy environment variables template
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties

# Edit application-local.properties with your configuration
# (See Environment Configuration section below)

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend will start at **http://localhost:5000**

### 3. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local

# Edit .env.local with your configuration
# (See Environment Configuration section below)

# Start development server
npm run dev
```

The frontend will start at **http://localhost:5173**

---

## 🔐 Environment Configuration

### Frontend (.env.local)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx

# Feature Flags (set to "true" to enable, "false" to disable)
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_REMINDERS=true
VITE_ENABLE_PROMOS=true
VITE_ENABLE_ADMIN_STATS=true
```

### Backend (application-local.properties)

```properties
# Spring Boot
spring.application.name=gift-mart-api
server.port=5000

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/gift-mart
# OR for MongoDB Atlas:
# spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/gift-mart

# JWT Configuration
jwt.secret=your_long_random_secret_key_here
jwt.expiration=86400000

# Stripe Configuration
stripe.api.key=sk_test_xxxxxxxxxxxx

# Google Maps
google.maps.api.key=AIzaSyxxxxxxxxxxxxxxxxx

# Email Configuration (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Frontend URL (for CORS)
frontend.url=http://localhost:3000

# Shipping Configuration
giftmart.shipping.hub.latitude=6.927
giftmart.shipping.hub.longitude=80.771
```

---

## ▶️ Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend-java
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Test Credentials

**Admin Account:**
- Email: `admin@giftmart.com`
- Password: `admin123`

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future date & any CVC

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Core Endpoints

#### Authentication
```
POST   /api/auth/register         - Register new user
POST   /api/auth/login            - Login user
GET    /api/auth/me               - Get current user
POST   /api/auth/refresh          - Refresh JWT token
POST   /api/auth/reset-password   - Reset password
```

#### Products
```
GET    /api/products              - Get all products (paginated)
GET    /api/products/:id          - Get product details
GET    /api/products/categories   - Get all categories
GET    /api/search?q=...          - Search products
```

#### Cart & Checkout
```
GET    /api/cart                  - Get user's cart
POST   /api/cart/items            - Add item to cart
PUT    /api/cart/items/:id        - Update cart item
DELETE /api/cart/items/:id        - Remove from cart
GET    /api/amount-calculator     - Calculate order total
```

#### Orders
```
POST   /api/orders                - Create new order
GET    /api/orders/:id            - Get order details
GET    /api/users/orders          - Get user's order history
PUT    /api/orders/:id/status     - Update order status
```

#### Reviews
```
GET    /api/reviews/product/:id   - Get product reviews
POST   /api/reviews               - Create review
PUT    /api/reviews/:id           - Update review
```

#### Admin
```
GET    /api/admin/products        - Manage products
POST   /api/admin/products        - Add product
PUT    /api/admin/products/:id    - Edit product
DELETE /api/admin/products/:id    - Delete product
GET    /api/admin/orders          - View all orders
GET    /api/admin/users           - View all users
GET    /api/admin/stats           - Dashboard statistics
```

See **[docs/api.http](docs/api.http)** for detailed request examples.

---

## 💾 Database Schema

### Collections

#### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  addresses: [{
    _id: ObjectId,
    street: String,
    city: String,
    postal: String,
    latitude: Number,
    longitude: Number
  }],
  preferences: {
    receivePromos: Boolean,
    receiveReminders: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Products
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  price: Number,
  category: String,
  images: [String],
  stock: Number,
  rating: Number,
  reviews: [ObjectId],
  createdAt: Date
}
```

#### Orders
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  shippingFee: Number,
  serviceFee: Number,
  total: Number,
  status: String (pending, confirmed, shipped, delivered),
  payment: {
    method: String (card, cod),
    stripeId: String,
    status: String (pending, succeeded, failed)
  },
  shipping: {
    address: Object,
    distance: Number,
    estimatedDate: Date
  },
  createdAt: Date
}
```

---

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository

2. **Deploy Backend**
   - Create new Web Service
   - Select repository: `GIFT-MART`
   - Build command: `mvn clean install`
   - Start command: `java -jar target/gift-mart-api-1.0.0.jar`
   - Set environment variables (see `render.yaml`)

3. **Set Environment Variables in Render:**
   ```
   SPRING_PROFILES_ACTIVE=prod
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   STRIPE_API_KEY=sk_live_xxxxx
   GOOGLE_MAPS_API_KEY=xxxxx
   FRONTEND_URL=https://your-frontend-url.com
   ```

### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository

2. **Deploy Frontend**
   - Select `frontend` folder
   - Set environment variables:
     ```
     VITE_API_BASE_URL=https://your-backend.onrender.com/api
     VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
     VITE_GOOGLE_MAPS_API_KEY=xxxxx
     ```

3. **Deploy**
   - Vercel auto-deploys on git push

See **[render.yaml](render.yaml)** for Render configuration details.

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Setup Development Environment
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/GIFT-MART.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Follow the setup instructions above

### Code Style
- Use consistent indentation (2 spaces for frontend, 4 for backend)
- Follow existing naming conventions
- Write descriptive commit messages
- Add comments for complex logic

### Testing
- Test your changes thoroughly before submitting PR
- Test both frontend and backend changes
- Verify payment flows with Stripe test cards

### Submitting Changes
1. Commit your changes: `git commit -m "feat: description of changes"`
2. Push to your fork: `git push origin feature/your-feature`
3. Create Pull Request with detailed description
4. Ensure CI/CD checks pass

### Reporting Issues
- Check existing issues first
- Provide clear description and reproduction steps
- Include error messages and screenshots
- Specify your environment (OS, Node version, etc.)

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 📞 Support

### Documentation
- **Main README**: [README.md](README.md)
- **Backend API**: [backend-java/README.md](backend-java/README.md)
- **API Contracts**: [docs/API_ORDERS.md](docs/API_ORDERS.md)
- **Deployment Guide**: [render.yaml](render.yaml)
- **Feature Flags**: [frontend/src/config/features.js](frontend/src/config/features.js)

### Getting Help
1. Check the documentation files above
2. Review existing GitHub issues
3. Check Stripe testing guide: [docs/STRIPE_TESTING.md](docs/STRIPE_TESTING.md)
4. For API testing: [docs/api.http](docs/api.http)

### Contact
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions

---

## 🙏 Acknowledgments

- Gift Mart team and contributors
- Stripe for payment processing
- Google Maps for location services
- React, Spring Boot, and MongoDB communities

---

**Made with ❤️ by the Gift Mart Team**
