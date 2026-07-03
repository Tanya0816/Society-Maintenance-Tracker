const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
const initializeTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'resident')),
      apartment TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Complaints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'resolved', 'closed')),
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
      location TEXT,
      photo_urls TEXT,
      admin_notes TEXT,
      admin_id INTEGER,
      resolved_at DATETIME,
      closed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Complaint history table (NEW - for audit trail)
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaint_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      action_type TEXT NOT NULL CHECK(action_type IN ('status_change', 'priority_change', 'comment', 'assignment', 'photo_added', 'resolved', 'closed')),
      old_value TEXT,
      new_value TEXT,
      user_id INTEGER NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Notices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
      author_id INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Email notifications table (NEW - for tracking sent emails)
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER,
      notice_id INTEGER,
      recipient_id INTEGER NOT NULL,
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'failed')),
      error_message TEXT,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
    CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON complaints(category_id);
    CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint_id ON complaint_history(complaint_id);
    CREATE INDEX IF NOT EXISTS idx_complaint_history_created_at ON complaint_history(created_at);
    CREATE INDEX IF NOT EXISTS idx_notices_is_active ON notices(is_active);
  `);

  // Seed default data if tables are empty
  seedDefaultData();
};

const seedDefaultData = () => {
  // Check if users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCount.count === 0) {
    const bcrypt = require('bcryptjs');
    
    // Create admin user
    const adminPassword = bcrypt.hashSync('password', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role, apartment, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Admin User', 'admin@demo.com', adminPassword, 'admin', 'Admin Office', '+1234567890');
    
    // Create demo resident users
    const residentPassword = bcrypt.hashSync('password', 10);
    db.prepare(`
      INSERT INTO users (name, email, password, role, apartment, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('John Resident', 'resident@demo.com', residentPassword, 'resident', 'A-101', '+1234567891');
    
    db.prepare(`
      INSERT INTO users (name, email, password, role, apartment, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Jane Smith', 'jane@demo.com', residentPassword, 'resident', 'B-205', '+1234567892');
    
    db.prepare(`
      INSERT INTO users (name, email, password, role, apartment, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('Mike Johnson', 'mike@demo.com', residentPassword, 'resident', 'C-301', '+1234567893');
  }

  // Check if categories exist
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  
  if (categoryCount.count === 0) {
    const categories = [
      { name: 'Plumbing', description: 'Water leaks, drainage issues, pipe problems', color: '#3B82F6' },
      { name: 'Electrical', description: 'Power outages, wiring issues, electrical appliances', color: '#F59E0B' },
      { name: 'Security', description: 'Security cameras, locks, safety concerns', color: '#EF4444' },
      { name: 'Cleaning', description: 'Common area cleaning, garbage collection', color: '#10B981' },
      { name: 'Infrastructure', description: 'Building maintenance, structural issues', color: '#6366F1' },
      { name: 'Parking', description: 'Parking space issues, vehicle problems', color: '#8B5CF6' },
      { name: 'Garden/Landscaping', description: 'Garden maintenance, tree trimming', color: '#059669' },
      { name: 'Other', description: 'Any other issues not covered above', color: '#6B7280' }
    ];
    
    categories.forEach(cat => {
      db.prepare(`
        INSERT INTO categories (name, description, color)
        VALUES (?, ?, ?)
      `).run(cat.name, cat.description, cat.color);
    });
  }

  // Check if notices exist
  const noticeCount = db.prepare('SELECT COUNT(*) as count FROM notices').get();
  
  if (noticeCount.count === 0) {
    const adminUser = db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
    
    if (adminUser) {
      db.prepare(`
        INSERT INTO notices (title, content, priority, author_id)
        VALUES (?, ?, ?, ?)
      `).run(
        'Welcome to Society Maintenance Tracker',
        'This platform helps you report and track maintenance issues. Please submit complaints with photos for faster resolution.',
        'normal',
        adminUser.id
      );
      
      db.prepare(`
        INSERT INTO notices (title, content, priority, author_id)
        VALUES (?, ?, ?, ?)
      `).run(
        'Emergency Contact Numbers',
        'Emergency: +1234567890 | Security: +1234567891 | Maintenance: +1234567892',
        'high',
        adminUser.id
      );
    }
  }

  console.log('Database initialized and seeded successfully');
};

// Helper function to add complaint history entry
const addComplaintHistory = (complaintId, actionType, oldValue, newValue, userId, comment = null) => {
  try {
    db.prepare(`
      INSERT INTO complaint_history (complaint_id, action_type, old_value, new_value, user_id, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(complaintId, actionType, oldValue, newValue, userId, comment);
    return true;
  } catch (error) {
    console.error('Error adding complaint history:', error);
    return false;
  }
};

module.exports = { db, initializeTables, addComplaintHistory };