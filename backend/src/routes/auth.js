const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Database setup
const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize admin user table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create default admin user if no users exist
  db.get('SELECT COUNT(*) as count FROM admin_users', (err, row) => {
    if (err) {
      console.error('Error checking admin users:', err);
      return;
    }
    
    if (row.count === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = 'admin123'; // Change this in production!
      const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
      
      db.run(
        'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
        [defaultUsername, hashedPassword],
        (err) => {
          if (err) {
            console.error('Error creating default admin user:', err);
          } else {
            console.log('Default admin user created:');
            console.log('Username: admin');
            console.log('Password: admin123');
            console.log('⚠️  Please change the default password in production!');
          }
        }
      );
    }
  });
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user in database
    db.get(
      'SELECT * FROM admin_users WHERE username = ?',
      [username],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = bcrypt.compareSync(password, user.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            username: user.username 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.userId,
        username: user.username
      }
    });
  });
});

// Change password endpoint (requires authentication)
router.post('/change-password', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current user from database
    db.get(
      'SELECT * FROM admin_users WHERE id = ?',
      [user.userId],
      (err, dbUser) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!dbUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = bcrypt.compareSync(currentPassword, dbUser.password_hash);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password and update
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        
        db.run(
          'UPDATE admin_users SET password_hash = ? WHERE id = ?',
          [hashedNewPassword, user.userId],
          (err) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({
              success: true,
              message: 'Password changed successfully'
            });
          }
        );
      }
    );
  });
});

module.exports = router;
