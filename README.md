# 📚 Book Rental System

A production-ready full-stack book rental application with strict role-based access control using CASL.

![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)
![Material-UI](https://img.shields.io/badge/Material--UI-5.15-purple)

## ✨ Features

### 👥 **User Roles**
- **👤 USER**: Browse and rent books
- **🏪 OWNER**: Upload books for rent and manage inventory  
- **👑 ADMIN**: Approve owners/books and manage the entire system

### 🔑 **Key Functionality**
- **🛡️ Role-based Access Control**: Implemented with CASL for both frontend and backend
- **📖 Book Management**: Upload, approve, and manage book inventory
- **🔄 Rental System**: Complete rental workflow with availability tracking
- **✅ Owner Management**: Admin approval system for book owners
- **💰 Revenue Tracking**: Wallet system for owner earnings
- **🔍 Server-side Filtering**: All table filtering and searching handled server-side
- **📱 Responsive Design**: Material-UI components with mobile-friendly design

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **CASL** for authorization
- **Zod** for validation
- **bcryptjs** for password hashing

### Frontend
- **Next.js** (React framework)
- **Material-UI** for components and styling
- **Material React Table** for data tables
- **CASL** for client-side permissions
- **Axios** for API calls
- **React Hook Form** with Zod validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd book-rental-system
   ```

2. **Run setup script**
   ```bash
   node setup.js
   ```

3. **Configure database**
   ```bash
   # Create PostgreSQL database
   createdb book_rental
   
   # Update backend/.env with your database credentials
   # Then seed the database
   cd backend && npm run seed
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:5000

### 🔑 Demo Accounts
| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@bookrental.com | admin123 |
| Owner | owner@example.com | owner123 |
| User  | user@example.com | user123 |

## 📖 Usage

### Admin Dashboard
- ✅ Approve/disable book owners
- ✅ Approve books for rental
- 📊 View system-wide statistics
- 🔧 Manage all books and rentals

### Owner Dashboard  
- 📚 Upload and manage books
- 💰 Track rental revenue and wallet balance
- 📈 View rental history
- ⚙️ Update book availability

### User Dashboard
- 🔍 Browse approved books with server-side filtering
- 📖 Rent available books
- 📋 Track rental history and due dates

## 🏗️ Project Structure

```
book-rental-system/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database & environment config
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, CASL
│   │   ├── routes/         # API endpoints
│   │   └── scripts/        # Database seeding
│   └── package.json
├── frontend/               # Next.js + Material-UI
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── lib/           # Utilities (API, CASL)
│   │   └── pages/         # Application pages
│   └── package.json
├── setup.js               # Automated setup script
├── QUICKSTART.md          # 5-minute setup guide
└── README.md              # This file
```

## 🔐 Security Features

- 🔒 JWT-based authentication
- 🔐 Password hashing with bcryptjs
- 🚦 Rate limiting on API endpoints
- 🛡️ CORS protection
- 🔰 Helmet security headers
- ✅ Input validation with Zod
- 🛡️ SQL injection protection with parameterized queries
- 👮 Role-based access control with CASL

## 🗄️ Database Schema

### Core Tables
- `users` - Base user authentication
- `owners` - Owner profile information
- `books` - Book inventory
- `categories` - Fixed book categories
- `rentals` - Rental transactions
- `wallets` - Owner revenue tracking

### Business Rules
- 📚 Books are only available if both book and owner are approved
- 🔄 When all copies are rented, book becomes unavailable
- 💰 Owner wallet balance increases when books are rented
- ❌ Disabled owners make all their books unavailable

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set:
- Database connection details
- JWT secret (use a strong, random secret)
- Frontend URL for CORS

### Build and Deploy
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the established code patterns
- Ensure CASL permissions are properly implemented
- Add proper error handling and validation
- Test with different user roles
- Use TypeScript-style JSDoc comments for better IDE support

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Material-UI](https://mui.com/)
- Authorization with [CASL](https://casl.js.org/)
- Database with [PostgreSQL](https://www.postgresql.org/)

---

**⭐ Star this repo if you find it helpful!**