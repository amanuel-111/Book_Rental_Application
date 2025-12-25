#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Book Rental System...\n');

// Create necessary directories
const directories = [
  'backend/src/config',
  'backend/src/controllers', 
  'backend/src/middleware',
  'backend/src/routes',
  'backend/src/scripts',
  'frontend/src/components/Auth',
  'frontend/src/components/Books',
  'frontend/src/components/Layout',
  'frontend/src/contexts',
  'frontend/src/lib',
  'frontend/src/pages/dashboard'
];

console.log('📁 Creating directories...');
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`   ✓ Created ${dir}`);
  }
});

// Copy environment files
console.log('\n📝 Setting up environment files...');
if (!fs.existsSync('backend/.env')) {
  if (fs.existsSync('backend/.env.example')) {
    fs.copyFileSync('backend/.env.example', 'backend/.env');
    console.log('   ✓ Created backend/.env from example');
    console.log('   ⚠️  Please update backend/.env with your database credentials');
  }
}

if (!fs.existsSync('frontend/.env.local')) {
  if (fs.existsSync('frontend/.env.local.example')) {
    fs.copyFileSync('frontend/.env.local.example', 'frontend/.env.local');
    console.log('   ✓ Created frontend/.env.local from example');
  }
}

console.log('\n📦 Installing dependencies...');

try {
  console.log('   Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('   Installing backend dependencies...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  
  console.log('   Installing frontend dependencies...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update backend/.env with your PostgreSQL credentials');
  console.log('2. Create the PostgreSQL database: createdb book_rental');
  console.log('3. Run database seed: cd backend && npm run seed');
  console.log('4. Start the application: npm run dev');
  console.log('\n🔑 Demo accounts will be created:');
  console.log('   Admin: admin@bookrental.com / admin123');
  console.log('   Owner: owner@example.com / owner123');
  console.log('   User: user@example.com / user123');
  
} catch (error) {
  console.error('\n❌ Error during setup:', error.message);
  console.log('\n🔧 Manual installation:');
  console.log('   npm install');
  console.log('   cd backend && npm install');
  console.log('   cd ../frontend && npm install');
}