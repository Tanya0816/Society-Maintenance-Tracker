const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { db, addComplaintHistory } = require('../config/database');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
});

// Create new complaint (residents only)
router.post('/', auth, upload.array('photos', 5), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category_id').isInt().withMessage('Valid category ID required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('location').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Only residents can create complaints
    if (req.user.role !== 'resident') {
      return res.status(403).json({ error: 'Only residents can create complaints' });
    }

    const { title, description, category_id, priority = 'medium', location } = req.body;
    
    // Handle photo uploads
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const result = db.prepare(`
      INSERT INTO complaints (title, description, category_id, user_id, priority, location, photo_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, category_id, req.user.id, priority, location, JSON.stringify(photoUrls));

    const complaint = db.prepare(`
      SELECT c.*, 
        cat.name as category_name, cat.color as category_color,
        u.name as user_name, u.apartment as user_apartment, u.email as user_email
      FROM complaints c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    // Add history entry
    addComplaintHistory(complaint.id, 'comment', null, 'Complaint created', req.user.id, 'Initial complaint submission');

    // Send email notification to admin
    if (complaint) {
      const adminEmails = db.prepare('SELECT email FROM users WHERE role = ?').all('admin').map(u => u.email);
      
      if (adminEmails.length > 0) {
        const template = emailTemplates.complaintCreated({
          title: complaint.title,
          userName: complaint.user_name,
          userApartment: complaint.user_apartment,
          category: complaint.category_name,
          priority: complaint.priority,
          description: complaint.description,
          location: complaint.location,
          hasPhoto: photoUrls.length > 0,
          url: process.env.FRONTEND_URL || 'http://localhost:5173'
        });

        adminEmails.forEach(email => {
          sendEmail(email, template.subject, template.html).catch(err => 
            console.error('Failed to send admin notification email:', err)
          );
        });
      }
    }

    res.status(201).json({ data: complaint, message: 'Complaint created successfully' });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Get complaints - Residents see all, Admins see all with enhanced filtering
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, category_id, search, has_photo } = req.query;
    
    let query = `
      SELECT c.*, 
        cat.name as category_name, cat.color as category_color,
        u.name as user_name, u.apartment as user_apartment,
        admin.name as admin_name
      FROM complaints c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users admin ON c.admin_id = admin.id
      WHERE 1=1
    `;
    const params = [];

    // Residents can see all complaints (as per requirement)
    // Admins see all complaints with enhanced filtering
    if (req.user.role === 'admin') {
      // Admin filtering options
      if (status) {
        query += ' AND c.status = ?';
        params.push(status);
      }
      if (priority) {
        query += ' AND c.priority = ?';
        params.push(priority);
      }
      if (category_id) {
        query += ' AND c.category_id = ?';
        params.push(category_id);
      }
      if (has_photo !== undefined) {
        if (has_photo === 'true') {
          query += ' AND c.photo_urls IS NOT NULL AND c.photo_urls != ""';
        } else {
          query += ' AND (c.photo_urls IS NULL OR c.photo_urls = "")';
        }
      }
      // Search in title and description
      if (search) {
        query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
    }

    query += ' ORDER BY c.created_at DESC';

    const complaints = db.prepare(query).all(...params);
    
    // Parse photo URLs
    complaints.forEach(c => {
      if (c.photo_urls) {
        try {
          c.photo_urls = JSON.parse(c.photo_urls);
        } catch {
          c.photo_urls = [];
        }
      } else {
        c.photo_urls = [];
      }
    });

    res.json({ data: complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Get single complaint with history
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = db.prepare(`
      SELECT c.*, 
        cat.name as category_name, cat.color as category_color,
        u.name as user_name, u.apartment as user_apartment, u.email as user_email,
        admin.name as admin_name
      FROM complaints c
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users admin ON c.admin_id = admin.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Parse photo URLs
    if (complaint.photo_urls) {
      try {
        complaint.photo_urls = JSON.parse(complaint.photo_urls);
      } catch {
        complaint.photo_urls = [];
      }
    } else {
      complaint.photo_urls = [];
    }

    // Get complaint history
    const history = db.prepare(`
      SELECT ch.*, u.name as user_name, u.role as user_role
      FROM complaint_history ch
      LEFT JOIN users u ON ch.user_id = u.id
      WHERE ch.complaint_id = ?
      ORDER BY ch.created_at DESC
    `).all(req.params.id);

    res.json({ data: { ...complaint, history } });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// Add comment to complaint (residents and admins)
router.post('/:id/comments', auth, [
  body('comment').trim().isLength({ min: 1 }).withMessage('Comment required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const complaint = db.prepare('SELECT * FROM complaints WHERE id = ?').get(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const { comment } = req.body;

    // Add history entry
    addComplaintHistory(req.params.id, 'comment', null, null, req.user.id, comment);

    res.json({ message: 'Comment added successfully' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;