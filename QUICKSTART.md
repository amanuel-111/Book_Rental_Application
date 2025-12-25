# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- Git

### 2. Clone & Setup
```bash
git clone <your-repo-url>
cd book-rental-system
node setup.js
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb book_rental

# Update backend/.env with your database credentials
# Then seed the database
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

## 🔧 Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check credentials in `backend/.env`
3. Verify database exists: `psql -l | grep book_rental`

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5000
npx kill-port 3000 5000
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm run setup
```

## 📚 Key Features Implemented

✅ **Role-based Access Control (CASL)**
✅ **JWT Authentication**
✅ **Server-side Filtering**
✅ **Material-UI Components**
✅ **PostgreSQL Database**
✅ **Responsive Design**
✅ **Production Ready**

## 🏗️ Architecture

```
book-rental-system/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/   # Database & environment
│   │   ├── routes/   # API endpoints
│   │   └── middleware/ # Auth & validation
├── frontend/         # Next.js + Material-UI
│   ├── src/
│   │   ├── pages/    # Application pages
│   │   ├── components/ # Reusable components
│   │   └── contexts/ # React contexts
└── README.md         # Full documentation
```

Need help? Check the full README.md for detailed documentation!