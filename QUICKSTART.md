# Quick Start Guide - MySQL Setup

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js (v18.17.0+)
- MySQL Server (Port 3306)
- Git

### 2. Clone & Setup
```bash
git clone https://github.com/amanuel-111/Book_Rental_Application
cd Book_Rental_Application
node setup.js
```

### 3. MySQL Database Setup
Ensure your MySQL server is running (you can use MAMP, XAMPP, or standard MySQL).

```bash
# 1. Access MySQL command line or your preferred GUI client:
mysql -u root -p -h localhost -P 3306

# 2. Create the database:
CREATE DATABASE book_rental;
exit;

# 3. Update backend/.env with your MySQL credentials:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=book_rental
# DB_USER=root
# DB_PASSWORD=root

# 4. Seed the database
cd backend
npm run seed
```

### 4. Start the Application
You will need two terminals to run both parts of the application.

**Backend Terminal:**
```bash
cd backend
npm run dev
```

**Frontend Terminal:**
```bash
cd frontend
npm run dev
```

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5003

### 5. Login with Demo Accounts
The seed script creates these accounts for development:

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@bookrental.com | admin123 |
| Owner | owner@example.com | owner123 |
| User  | user@example.com | user123 |

## 🎯 What You Can Do

### As Admin
- Approve book owners
- Approve books for rental
- View system statistics
- Manage all books and rentals

### As Owner
- Upload books for rent
- Track revenue and rentals
- Manage book inventory
- View earnings dashboard

### As User
- Browse available books
- Rent books
- Track rental history
- Return books

## 🔧 Troubleshooting

### MySQL Connection Issues
1. Ensure MySQL is running on port 3306.
2. Check your credentials in `backend/.env`.
3. Verify the `book_rental` database exists.

### Port Conflicts
```bash
# If ports 3001 or 5003 are in use, you can find and kill the process or change the port in .env files
npx kill-port 3001 5003
```

## 🏗️ Architecture

```
Book_Rental_Application/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/   # MySQL connection & schema
│   │   ├── routes/   # API endpoints
│   │   └── scripts/  # Database seeding
├── frontend/         # Next.js Application
│   ├── src/
│   │   ├── pages/    # Application pages
│   │   ├── components/ # Reusable components
│   │   └── contexts/ # React contexts
└── README.md         # Full documentation
```

## 📚 Key Features Implemented

✅ **MySQL Database Integration**
✅ **Role-based Access Control (CASL)**
✅ **JWT Authentication**
✅ **Server-side Filtering**
✅ **Custom UI Components**
✅ **Responsive Design**

Need help? Check the full README.md for detailed documentation!