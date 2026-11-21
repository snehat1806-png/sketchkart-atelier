# 🎨 SketchKart Atelier

### A Multi-Artist Marketplace for Handmade Art & Custom Creations

SketchKart Atelier is an online art marketplace designed to connect independent artists with customers who appreciate creativity, handmade artwork, and personalized artistic creations.

The platform aims to provide artists with an opportunity to showcase their artwork, build their portfolios, and sell their creations, while allowing customers to discover artists, explore different art categories, purchase ready-made artwork, and request customized pieces.

The vision is to develop a complete multi-vendor art marketplace where artists and customers can interact throughout the artwork discovery, ordering, customization, and delivery process.

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Project Vision](#-project-vision)
- [User Roles](#-user-roles)
- [Features](#-features)
- [Artwork Categories](#-artwork-categories)
- [Platform Workflows](#-platform-workflows)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Demo Account](#-demo-account)
- [Development Roadmap](#-development-roadmap)
- [Security Considerations](#-security-considerations)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [Project Status](#-project-status)
- [Developer](#-developer)

---

## 📌 About the Project

SketchKart Atelier is being developed as a multi-artist online marketplace focused on handmade and customized artwork.

Unlike a traditional single-vendor art store, the platform is intended to support multiple independent artists, allowing each artist to showcase their creative work and interact with potential customers.

Customers can explore artwork, discover artists, purchase existing creations, and submit requests for personalized artwork.

The project focuses on creating an accessible digital space for artists while providing customers with a convenient way to discover and purchase unique artistic creations.

## 🎯 Project Vision

The primary objective is to build a scalable, user-friendly, and secure online marketplace for the creative community.

The platform aims to:

- Connect independent artists with customers.
- Support multiple artists on a single marketplace.
- Provide artists with individual portfolios and artwork listings.
- Allow customers to discover artwork across multiple categories.
- Support ready-made artwork purchases.
- Enable personalized artwork and custom commission requests.
- Provide a structured order management experience.
- Establish a reliable platform for communication between artists and customers.

---

## 👥 User Roles

The platform is designed around three primary user roles.

### 1. Customer

Customers will be able to:

- Create an account and log in.
- Browse available artwork.
- Explore different artwork categories.
- Discover artists and their portfolios.
- View artwork details.
- Add artwork to their shopping cart.
- Place orders for available artwork.
- Request customized artwork.
- Communicate with artists.
- Track order progress.
- Submit reviews and ratings.

### 2. Artist

Artists will be able to:

- Register on the platform.
- Create and manage their artist profiles.
- Upload and showcase artwork.
- Build an individual portfolio.
- List artwork for sale.
- Manage artwork listings.
- Receive custom artwork requests.
- Respond to customer inquiries.
- Manage customer orders.
- Update artwork and order progress.

### 3. Administrator

The planned administration system will provide:

- Customer account management.
- Artist account management.
- Artist verification and approval.
- Artwork listing moderation.
- Order monitoring.
- Platform activity management.
- Review and report management.

*Note: These roles describe the intended platform functionality. Features will be marked as implemented only after their backend and frontend functionality has been verified.*

---

## ✨ Features

### Customer Features

- User registration and authentication.
- Artwork discovery and browsing.
- Category-based artwork navigation.
- Artist discovery.
- Shopping cart.
- Order placement.
- Custom artwork requests.
- Order history.

### Artist Features

- Artist registration.
- Artist profile management.
- Artwork listing.
- Portfolio presentation.
- Custom request handling.
- Order management.

### Marketplace Features

- Multiple independent artists.
- Different artwork categories.
- Ready-made artwork listings.
- Customized artwork ordering.
- Artist-customer interaction.
- Customer feedback and reviews.

### Authentication and Backend

- Node.js backend.
- Express.js server.
- MongoDB database.
- JWT-based authentication.

---

## 🖼️ Artwork Categories

The marketplace is intended to support different types of artwork, including:

- Pencil Sketches
- Charcoal Sketches
- Portraits
- Couple Portraits
- Family Portraits
- Pet Portraits
- Digital Art
- Watercolor Paintings
- Acrylic Paintings
- Canvas Paintings
- Handmade Gifts
- Customized Frames
- Abstract Art
- Traditional Artwork

Artists will be able to showcase their work under relevant categories.

---

## 🔄 Platform Workflows

### 1. Customer Registration

Customer visits the platform → Creates an account → Logs in → Explores artwork → Selects an artist or artwork.

### 2. Artist Registration

Artist visits the platform → Registers an account → Creates an artist profile → Uploads artwork → Builds a portfolio → Receives customer interest.

### 3. Ready-Made Artwork Purchase

Customer browses artwork → Opens artwork details → Adds artwork to cart → Places an order → Completes payment → Artist processes the order → Artwork is delivered.

### 4. Custom Artwork Request

Customer discovers an artist → Submits a customization request → Artist reviews the request → Artist provides pricing and details → Customer approves the proposal → Payment is completed → Artist creates the artwork → Artwork is delivered.

### 5. Artist-Customer Communication

Customer contacts an artist → Discusses artwork requirements → Shares customization preferences → Finalizes artwork details.

### 6. Order Management

Customer places an order → Order is received → Artist processes the order → Order status is updated → Customer receives the completed artwork.

*The workflows above represent the intended end-to-end marketplace experience. Individual steps depend on the implementation of the corresponding features.*

---

## 🛠️ Technology Stack

The current project is built using the following technologies:

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | Styling and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend web framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |

### Planned Integrations

The following technologies may be introduced as the platform evolves:

| Technology | Planned Purpose |
|---|---|
| Socket.IO | Real-time communication |
| Cloudinary | Artwork image storage |
| Razorpay | Online payment processing |
| Nodemailer | Email notifications |
| Jest / Supertest | Automated testing |

These are planned integrations, not confirmed existing dependencies.

---

## 📁 Project Structure

The currently verified repository root contains:

```text
sketchkart-atelier/
│
├── public/
├── uploads/
│
├── .env.example
├── .gitignore
├── README.md
├── package-lock.json
├── package.json
└── server.js
```

The frontend pages documented in the existing project include:

```text
public/
│
├── index
├── Sketches
├── Paintings
├── Portraits
├── CustomGifts
├── artists
├── login
├── cart
├── orders
├── sell
└── custom
```

*The frontend listing above identifies the pages referenced by the existing project documentation. Exact filenames, extensions, nested folders, and additional assets should be confirmed against the source directory.*

---

## ⚙️ Installation and Setup

Follow these steps to run SketchKart Atelier locally.

### Prerequisites

Install the following:

- Node.js
- npm
- MongoDB
- Git
- Visual Studio Code (recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/snehat1806-png/sketchkart-atelier.git
```

### Step 2: Navigate to the Project

```bash
cd sketchkart-atelier
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the project root using `.env.example` as the reference.

Add the required database connection and authentication configuration.

### Step 5: Start the Application

```bash
npm start
```

### Step 6: Open the Application

Visit:

```text
http://localhost:3000
```

Make sure MongoDB is running and the environment variables are configured correctly before starting the server.

---

## 🔐 Environment Configuration

The application requires environment variables for database connectivity and authentication.

The existing project documentation identifies:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Check `.env.example` for the complete and exact configuration required by the current backend.

**Important:** Never upload your actual `.env` file, database credentials, JWT secrets, or API keys to GitHub.

---

## 🧪 Demo Account

The existing project documentation describes an automatically created demo artist account on the first application startup.

**Demo Artist**

```text
Email: demo.artist@sketchkart.test
Password: demo1234
```

This account is intended for local development and testing.

Do not use demo credentials for a production deployment.

---

## 🗺️ Development Roadmap

The project will evolve through the following development phases.

### Phase 1 — Existing Application Foundation

- Frontend pages and navigation.
- Node.js and Express backend.
- MongoDB integration.
- User authentication.
- Artwork browsing.
- Shopping cart and order foundation.

### Phase 2 — Multi-Artist Marketplace

- Multiple artist accounts.
- Artist profile management.
- Individual artist portfolios.
- Artwork upload and management.
- Artist-specific order management.
- Artist verification.

### Phase 3 — Custom Artwork System

- Custom artwork request submission.
- Artist quotations.
- Customer quotation approval.
- Custom order creation.
- Request status management.

### Phase 4 — Communication and Payments

- Customer-artist messaging.
- Real-time communication.
- Online payment integration.
- Payment verification.
- Payment and order notifications.

### Phase 5 — Production Readiness

- Secure role-based access control.
- Input validation.
- API security.
- Automated testing.
- Error handling and logging.
- Image storage optimization.
- Deployment.
- Performance optimization.

---

## 🔒 Security Considerations

Security is an important part of developing a reliable marketplace.

The development process will focus on:

- Secure authentication.
- Password hashing.
- Role-based authorization.
- Server-side input validation.
- Secure image uploads.
- Payment verification.
- Protection of sensitive environment variables.
- Proper error handling.
- Database access security.

---

## 🚀 Future Scope

Potential future improvements include:

- Artist analytics dashboard.
- Personalized artwork recommendations.
- Wishlist functionality.
- Advanced artwork search and filtering.
- Discount coupons.
- Artist subscription plans.
- Multiple shipping options.
- Delivery tracking.
- Customer notifications.
- Mobile-friendly experience.
- Progressive Web App support.
- Advanced marketplace administration.

---

## 🤝 Contributing

Contributions and suggestions are welcome as the project evolves.

For major changes:

1. Discuss the proposed change first.
2. Create a separate development branch.
3. Make the required changes.
4. Test the functionality.
5. Submit a pull request with a clear description.

---

## 📌 Project Status

**Status: Active Development**

SketchKart Atelier is currently being developed into a multi-artist online art marketplace.

The project is evolving from its initial marketplace foundation toward a complete platform supporting artist portfolios, artwork purchases, custom commissions, customer-artist communication, and order management.

Features and integrations will be documented as they are implemented and tested.

---

## 👩‍💻 Developer

**Project:** SketchKart Atelier

**GitHub Repository:**

https://github.com/snehat1806-png/sketchkart-atelier

Developed with the goal of creating a digital marketplace that connects artists, creativity, and customers.

---

⭐ If you find this project interesting, consider following its development on GitHub.
