# 📚 Book Rental System

A production-ready full-stack book rental application with strict role-based access control using CASL.

![Node.js](https://img.shields.io/badge/Node.js-v16+-green)
![Next.js](https://img.shields.io/badge/Next.js-14.0-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)
![CASL](https://img.shields.io/badge/CASL-Authorization-purple)

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
- **💰 Revenue Tracking**: Wallet system and revenue analytics for owners
- **📊 Admin Statistics**: Comprehensive platform analytics and reporting
- **🔍 Server-side Filtering**: All table filtering and searching handled server-side
- **🎨 Custom Dark Theme**: Beautiful dark UI with consistent styling
- **📱 Responsive Design**: Mobile-friendly responsive layout

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database (MAMP compatible)
- **JWT** authentication
- **CASL** for authorization
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **Rate limiting** for API protection

### Frontend
- **Next.js** (React framework)
- **Custom CSS Modules** for styling
- **Dark Theme** with consistent color scheme
- **CASL** for client-side permissions
- **Axios** for API calls
- **Context API** for state management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MAMP with MySQL (port 3306)
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

3. **Configure MAMP MySQL database**
   ```bash
   # Start MAMP and ensure MySQL is running on port 3306
   # Create database via phpMyAdmin or command line:
   mysql -u root -p -h localhost -P 3306
   CREATE DATABASE book_rental;
   
   # Update backend/.env with MAMP credentials
   # Then seed the database
   cd backend && npm run seed
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   - **Frontend**: http://localhost:3001
   - **Backend**: http://localhost:5003

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
- 📊 View comprehensive platform statistics
- 📈 Monitor activity trends and top performers
- 🔧 Manage all books and rentals
- 👥 Oversee user and owner management

### Owner Dashboard  
- 📚 Upload and manage books
- 💰 Track rental revenue with detailed analytics
- 📈 View revenue trends and transaction history
- 📋 Monitor rental activity
- ⚙️ Update book availability and pricing

### User Dashboard
- 🔍 Browse approved books with advanced filtering
- 📖 Rent available books with real-time availability
- 📋 Track rental history and due dates
- 👤 Manage profile and account settings

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
├── frontend/               # Next.js + Custom CSS
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── lib/           # Utilities (API, CASL)
│   │   ├── pages/         # Application pages
│   │   └── styles/        # CSS modules and global styles
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
- ✅ Input validation and sanitization
- 🛡️ SQL injection protection with parameterized queries
- 👮 Role-based access control with CASL
- 🔐 Environment variable protection

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
- Authorization with [CASL](https://casl.js.org/)
- Database with [MySQL](https://www.mysql.com/)
- Styled with custom CSS modules

---

**⭐ Star this repo if you find it helpful!**