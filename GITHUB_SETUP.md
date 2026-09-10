# 🚀 GitHub Setup Guide

This guide will help you set up this Book Rental Application project on GitHub.

## 📋 Pre-Setup Checklist

Before pushing to GitHub, ensure:
- [ ] All sensitive data is in `.env` files (already gitignored)
- [ ] `.env.example` files are created for both frontend and backend
- [ ] No hardcoded passwords or API keys in the code
- [ ] All dependencies are properly listed in `package.json` files

## 🔧 Initial Setup

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Book Rental Application"
```

### 2. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `Book_Rental_Application`
3. **Don't** initialize with README (we already have one)
4. Set visibility (Public/Private)

### 3. Connect Local Repository to GitHub
```bash
# Replace YOUR_USERNAME and YOUR_REPO_NAME with actual values
git remote add origin https://github.com/YOUR_USERNAME/Book_Rental_Application.git
git branch -M main
git push -u origin main
```

## 🔒 Security Considerations

### Environment Variables
The following files contain sensitive data and are **already gitignored**:
- `backend/.env`
- `frontend/.env.local`

### Example Files Included
- `backend/.env.example` - Template for backend environment variables
- `frontend/.env.example` - Template for frontend environment variables

### Important Notes
- ⚠️ **Never commit actual `.env` files**
- ✅ Always use `.env.example` files as templates
- 🔑 Change JWT_SECRET in production
- 🔐 Use strong database passwords in production

## 📝 Repository Description

Use this description for your GitHub repository:

```
A full-stack book rental application with role-based access control (ADMIN/OWNER/USER), built with Next.js, Node.js, MySQL, and CASL authorization. Features include book management, rental system, revenue tracking, and administrative dashboard.
```

## 🏷️ Suggested Topics/Tags

Add these topics to your GitHub repository:
- `nextjs`
- `nodejs`
- `mysql`
- `book-rental`
- `casl`
- `jwt-authentication`
- `role-based-access`
- `full-stack`
- `express`

## 📊 GitHub Features to Enable

### 1. Issues
Enable Issues for bug reports and feature requests

### 2. Projects
Create a project board with columns:
- 📋 Backlog
- 🔄 In Progress  
- 👀 Review
- ✅ Done

## 🚀 Deployment Setup

To deploy the application to a production environment:

### Frontend
1. Connect your GitHub repo to a hosting platform (e.g., Vercel, Netlify)
2. Set environment variables (`NEXT_PUBLIC_API_URL`)
3. Ensure the build command is `npm run build` from the `frontend` directory

### Backend
1. Connect the repository to a Node.js hosting platform
2. Set up a production MySQL database
3. Configure the backend `.env` variables with the production credentials and frontend URL
4. Ensure the start command properly executes the server from the `backend` directory

## 📋 Post-Setup Tasks

After pushing to GitHub:

1. **Update README links** if needed
2. **Create releases** for version management
3. **Set up branch protection** for main branch

## 🤝 Contributing Guidelines

Create a `CONTRIBUTING.md` file with:
- Code style guidelines
- Pull request process
- Issue reporting templates

## 📄 License

This project uses the MIT License - see the `LICENSE` file.