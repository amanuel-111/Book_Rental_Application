# 📚 Book Rental Application

A full-stack book rental management application built with Next.js, Node.js, Express, MySQL, JWT authentication, and CASL-based role-based access control. 

![Node.js](https://img.shields.io/badge/Node.js-18.17.0+-green)
![Next.js](https://img.shields.io/badge/Next.js-15.1.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)
![CASL](https://img.shields.io/badge/CASL-Authorization-purple)

## 📋 Overview

This application provides a platform where users can rent books, owners can list and manage their book inventory, and administrators can oversee the entire system. It features an internal wallet system to track owner revenue and robust role-based access control.

## ✨ Features

### 👥 User Roles
- **👤 USER**: Browse approved books, rent available books, and track rental history.
- **🏪 OWNER**: Upload books for rent, manage inventory quantities, and track rental revenue.
- **👑 ADMIN**: Approve or disable owners, approve books for listing, and oversee platform statistics.

### 🛡️ Authentication & Authorization
- JWT-based authentication with bcryptjs password hashing.
- Request validation and route protection.
- Role-based Access Control (RBAC) implemented with CASL on both the frontend and backend.

### 📖 Book Management
- Owners can upload books with details (title, author, category, pricing, quantities).
- Books require admin approval before becoming visible to users.
- Availability tracking ensures books cannot be rented when stock runs out.

### 🔄 Rental System
- Users can rent available books for specific durations.
- Due date tracking and return handling.
- Current book availability is transactionally calculated from rental/book inventory data.

### 💰 Owner Revenue Tracking
- Internal wallet system tracks revenue for owners.
- Wallet balances automatically increase when books are successfully rented.
- Dashboard for owners to view transaction history and revenue statistics.

### 📊 Admin Dashboard
- Platform statistics and administrative reporting.
- Centralized approval workflow for owners and books.
- Ability to monitor overdue rentals.

### 🔍 Search & Filtering
- Selected data tables (books and rentals) support server-side search, filtering, and pagination.

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **MySQL** database (mysql2 driver)
- **JWT** authentication (`jsonwebtoken`)
- **CASL** (`@casl/ability`) for authorization
- **bcryptjs** for password hashing
- **Helmet** and **cors** for security headers and CORS protection
- **Express Rate Limit** for API protection

### Frontend
- **Next.js** (v15.1.0)
- **React** (v18.2.0)
- **Custom CSS Modules** for styling with a dark theme
- **CASL** for client-side permissions
- **Axios** for API calls
- **Context API** for state management
- **React Hook Form** & **Zod** for form validation

## 🏗️ Architecture / Project Structure

```
Book_Rental_Application/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database configuration & SQL schema
│   │   ├── middleware/     # Auth, CASL, and validation middleware
│   │   ├── routes/         # API endpoints (auth, books, rentals, etc.)
│   │   └── scripts/        # Database seeding script (seed.js)
│   └── package.json
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Contexts (AuthContext)
│   │   ├── lib/            # Utilities (API configuration, CASL abilities)
│   │   ├── pages/          # Next.js pages and routing
│   │   └── styles/         # CSS modules and global styles
│   └── package.json
├── setup.js               # Automated dependency and directory setup script
├── QUICKSTART.md          # 5-minute local setup guide
└── README.md              # Project documentation
```

## 🚀 Prerequisites

- Node.js (v18.17.0 or higher)
- MySQL Server (Port 3306)
- npm or yarn

## 💻 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amanuel-111/Book_Rental_Application
   cd Book_Rental_Application
   ```

2. **Run the setup script**
   ```bash
   node setup.js
   ```
   *(This script creates necessary directories, installs root/backend/frontend dependencies, and copies `.env.example` files to `.env`)*

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory based on `backend/.env.example`.
- `PORT` - The port the backend will run on (default 5003).
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Your MySQL database connection credentials.
- `JWT_SECRET` - A strong random string for signing JWT tokens.
- `JWT_EXPIRES_IN` - Token expiration time (e.g., `7d`).
- `FRONTEND_URL` - URL of the frontend application for CORS configuration.

### Frontend (`frontend/.env.local` or `frontend/.env`)
Create a `.env` file in the `frontend` directory based on `frontend/.env.example`.
- `NEXT_PUBLIC_API_URL` - URL pointing to the backend API (e.g., `http://localhost:5003/api`).

## 🗄️ Database Setup & Seed Data

Ensure your MySQL server is running. You can use standard MySQL or a local environment like MAMP/XAMPP.

1. **Create the database**
   ```sql
   CREATE DATABASE book_rental;
   ```

2. **Seed the database**
   Run the seed script from the backend directory to create tables, categories, and demo accounts:
   ```bash
   cd backend
   npm run seed
   ```

### 🔑 Demo Accounts
The seed script will automatically create development accounts for Admin, Owner, and User roles. For security reasons, the default passwords are not listed publicly. Please refer to the source code of `backend/src/scripts/seed.js` for the exact credentials generated during seeding.

## 🏃 Running the Application

This repository consists of two separate applications that need to be run concurrently in development.

**1. Start the Backend API**
Open a terminal in the `backend` directory:
```bash
cd backend
npm run dev
```
*The backend API will run on http://localhost:5003 (or your configured port).*

**2. Start the Frontend Application**
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm run dev
```
*The Next.js frontend will run on http://localhost:3001.*

## 🔒 Security

- Request validation is implemented to ensure data integrity.
- SQL injection protection with `mysql2` parameterized queries.
- Password hashing using `bcryptjs`.
- Express API protected by `helmet` and `express-rate-limit`.
- Private routes on both frontend and backend are protected via JWT and CASL.
- CORS configuration restricts API access to the designated frontend URL.

## 📐 Database Schema

The core tables used in this application are:
- `users`: Base user authentication and role definition.
- `owners`: Extends users with owner-specific profile information and approval status.
- `books`: Book inventory, including pricing, categories, and availability quantities.
- `categories`: Fixed book categories.
- `rentals`: Tracks rental transactions, due dates, and statuses.
- `wallets`: Internal ledger for tracking owner revenue from rentals.

## 📋 Business Rules

The backend enforces the following core business logic:
- Books are only available for rent if both the book and its owner have been approved by an Admin.
- When all copies of a book are rented (`available_quantity` reaches 0), the book can no longer be rented.
- An owner's internal wallet balance increases when their books are rented.
- Users cannot rent a book if they already have an active rental for that same book.
- Disabled or unapproved owners have their books hidden from the public browsing view.

## ⚠️ Current Limitations

- **Local Deployment Only:** There is currently no configured production deployment process (e.g., Dockerfiles, CI/CD pipelines, production build instructions).
- **Internal Ledger:** The wallet system tracks balances internally; it does not integrate with an external payment gateway (like Stripe or PayPal) to process real financial transactions.
- **Transactional Availability:** Book availability is calculated at the time of API request. It does not utilize real-time WebSocket synchronization to instantly push availability updates to connected clients.
- **Testing:** Currently lacks an automated test suite (Jest, Cypress, etc.).

## 🔮 Future Improvements

- Add automated unit and integration tests.
- Integrate a real payment gateway (Stripe) for processing rental payments and owner payouts.
- Add email notifications and automated reminders for overdue rentals.
- Provide Docker configuration for easier production deployment.
- Implement WebSockets for real-time notifications and book availability updates.
- Improve observability with structured logging and performance monitoring.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.