const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedDatabase() {
  // First, create database if it doesn't exist
  console.log('🔗 Connecting to MySQL server...');
  
  // Connect without database first
  const setupConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root'
  });

  try {
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'book_rental';
    await setupConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' ready`);
  } finally {
    await setupConnection.end();
  }

  // Now connect to the specific database
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'book_rental',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('🗄️  Creating database schema...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('📚 Seeding categories...');
    
    // Seed categories
    const categories = [
      { name: 'Fiction', description: 'Fictional stories and novels' },
      { name: 'Non-Fiction', description: 'Factual books and biographies' },
      { name: 'Science', description: 'Scientific and technical books' },
      { name: 'Technology', description: 'Programming and technology books' },
      { name: 'Business', description: 'Business and entrepreneurship books' },
      { name: 'History', description: 'Historical books and documentaries' },
      { name: 'Biography', description: 'Life stories and memoirs' },
      { name: 'Self-Help', description: 'Personal development books' },
      { name: 'Education', description: 'Educational and academic books' },
      { name: 'Children', description: 'Books for children and young adults' }
    ];
    
    for (const category of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
        [category.name, category.description]
      );
    }
    
    console.log('👑 Creating admin user...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(
      'INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
      ['admin@bookrental.com', adminPassword, 'ADMIN']
    );
    
    console.log('🏪 Creating sample owner...');
    
    // Create sample owner
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const [ownerUserResult] = await connection.execute(
      'INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
      ['owner@example.com', ownerPassword, 'OWNER']
    );
    
    if (ownerUserResult.insertId) {
      const [ownerResult] = await connection.execute(
        'INSERT INTO owners (user_id, first_name, last_name, phone, address, location, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ownerUserResult.insertId, 'John', 'Doe', '+1234567890', '123 Main St', 'New York', true]
      );
      
      // Create wallet for owner
      await connection.execute(
        'INSERT INTO wallets (owner_id, balance, total_earned) VALUES (?, ?, ?)',
        [ownerResult.insertId, 0.00, 0.00]
      );
    } else {
      // Owner user already exists, check if owner profile exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        ['owner@example.com']
      );
      
      if (existingUser.length > 0) {
        const userId = existingUser[0].id;
        
        // Check if owner profile exists
        const [existingOwner] = await connection.execute(
          'SELECT id FROM owners WHERE user_id = ?',
          [userId]
        );
        
        if (existingOwner.length === 0) {
          // Create owner profile
          const [ownerResult] = await connection.execute(
            'INSERT INTO owners (user_id, first_name, last_name, phone, address, location, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, 'John', 'Doe', '+1234567890', '123 Main St', 'New York', true]
          );
          
          // Create wallet for owner
          await connection.execute(
            'INSERT INTO wallets (owner_id, balance, total_earned) VALUES (?, ?, ?)',
            [ownerResult.insertId, 0.00, 0.00]
          );
        }
      }
    }
    
    console.log('👤 Creating sample user...');
    
    // Create sample user
    const userPassword = await bcrypt.hash('user123', 10);
    await connection.execute(
      'INSERT IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
      ['user@example.com', userPassword, 'USER']
    );
    
    await connection.commit();
    console.log('\n✅ Database seeded successfully!');
    
    console.log('\n🔑 Default accounts created:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Admin: admin@bookrental.com / admin123  │');
    console.log('│ Owner: owner@example.com / owner123     │');
    console.log('│ User:  user@example.com / user123       │');
    console.log('└─────────────────────────────────────────┘');
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
    process.exit(0);
  }
}

seedDatabase();