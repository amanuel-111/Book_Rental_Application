# Quick Start Guide - MAMP MySQL Setup

## 🚀 Get Started in 5 Minutes with MAMP

### 1. Prerequisites
- Node.js (v16+)
- MAMP (with MySQL running on port 3306)
- Git

### 2. Clone & Setup
```bash
git clone https://github.com/amanuel-111/Book_Rental_Application.git
cd Book_Rental_Application
node setup.js
```

### 3. MAMP MySQL Setup
```bash
# 1. Start MAMP and ensure MySQL is running on port 3306
# 2. Create database using phpMyAdmin or MySQL command line:

# Via phpMyAdmin:
# - Open http://localhost/phpMyAdmin
# - Create new database named 'book_rental'

# Via MySQL command line:
mysql -u root -p -h localhost -P 3306
CREATE DATABASE book_rental;
exit;

# 3. Update backend/.env with MAMP credentials:
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
```bash
# From root directory
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MAMP**: http://localhost/phpMyAdmin (database management)

### 5. Login with Demo Accounts

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

## 🔧 MAMP Troubleshooting

### MySQL Connection Issues
1. Ensure MAMP is running and MySQL port is 3306
2. Check MAMP MySQL credentials (usually root/root)
3. Verify database exists in phpMyAdmin
4. Check `backend/.env` configuration

### Port Conflicts
```bash
# If ports 3000 or 5000 are in use
npx kill-port 3000 5000
```

### MAMP MySQL Not Starting
1. Check MAMP logs for errors
2. Ensure no other MySQL instances are running
3. Try changing MySQL port in MAMP preferences
4. Update `backend/.env` with new port

### Database Access Denied
```bash
# Reset MAMP MySQL password if needed
# Or use MAMP's default credentials:
# Username: root
# Password: root (or empty)
```

## 📊 MAMP Database Management

### Using phpMyAdmin
- **URL**: http://localhost/phpMyAdmin
- **Username**: root
- **Password**: root (or check MAMP settings)

### Direct MySQL Access
```bash
# Connect to MAMP MySQL
mysql -u root -p -h localhost -P 3306

# Show databases
SHOW DATABASES;

# Use book rental database
USE book_rental;

# Show tables
SHOW TABLES;
```

## 🏗️ Architecture

```
book-rental-system/
├── backend/          # Node.js + Express + MySQL
│   ├── src/
│   │   ├── config/   # MySQL connection & schema
│   │   ├── routes/   # API endpoints
│   │   └── scripts/  # Database seeding
├── frontend/         # Next.js + Material-UI
│   ├── src/
│   │   ├── pages/    # Application pages
│   │   ├── components/ # Reusable components
│   │   └── contexts/ # React contexts
└── README.md         # Full documentation
```

## 📚 Key Features Implemented

✅ **MySQL Database** (MAMP compatible)
✅ **Role-based Access Control (CASL)**
✅ **JWT Authentication**
✅ **Server-side Filtering**
✅ **Material-UI Components**
✅ **Responsive Design**
✅ **Production Ready**

Need help? Check the full README.md for detailed documentation!