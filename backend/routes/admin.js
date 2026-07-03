const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, adminOnly } = require('../middleware/auth');
const { db, addComplaintHistory } = require('../config/database');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// Get all complaints for admin with comprehensive filtering
router.get('/complaints', adminOnly, async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      category_id, 
      search, 
      has_photo,
      sort_by = 'created_at',
      sort_order = 'DESC' 
    } = req.query;
    
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

    // Apply filters
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
    // Search in title AND description (key user requirement)
    if (search) {
      query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'priority', 'status'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    query += ` ORDER BY c.${sortField} ${sort_order === 'DESC' ? 'DESC' : 'ASC'}`;

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

    // Get statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM complaints
    `).get();

    res.json({ 
      data: complaints, 
      stats: {
        total_complaints: stats.total_complaints,
        pending: stats.pending,
        in_progress: stats.in_progress,
        resolved: stats.resolved,
        closed: stats.closed
      }
    });
  } catch (error) {
    console.error('Error fetching admin complaints:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Update complaint status
router.patch('/complaints/:id/status', adminOnly, [
  body('status').isIn(['pending', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('comment').optional().trim()
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

    const { status, comment } = req.body;
    const oldStatus = complaint.status;

    // Update complaint
    db.prepare('UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, req.params.id);

    // Set resolved_at or closed_at timestamps
    if (status === 'resolved' && !complaint.resolved_at) {
      db.prepare('UPDATE complaints SET resolved_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(req.params.id);
    }
    if (status === 'closed' && !complaint.closed_at) {
      db.prepare('UPDATE complaints SET closed_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(req.params.id);
    }

    // Assign admin if not already assigned
    if (!complaint.admin_id) {
      db.prepare('UPDATE complaints SET admin_id = ? WHERE id = ?')
        .run(req.user.id, req.params.id);
    }

    // Add history entry
    addComplaintHistory(req.params.id, 'status_change', oldStatus, status, req.user.id, comment);

    // Send email notification to resident
    const resident = db.prepare('SELECT email, name FROM users WHERE id = ?').get(complaint.user_id);
    if (resident) {
      const template = emailTemplates.statusUpdated({
        complaintTitle: complaint.title,
        oldStatus: oldStatus,
        newStatus: status,
        adminComment: comment,
        url: process.env.FRONTEND_URL || 'http://localhost:5173'
      });

      sendEmail(resident.email, template.subject, template.html).catch(err =>
        console.error('Failed to send status update email:', err)
      );
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Update complaint priority
router.patch('/complaints/:id/priority', adminOnly, [
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('comment').optional().trim()
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

    const { priority, comment } = req.body;
    const oldPriority = complaint.priority;

    // Update complaint
    db.prepare('UPDATE complaints SET priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(priority, req.params.id);

    // Add history entry
    addComplaintHistory(req.params.id, 'priority_change', oldPriority, priority, req.user.id, comment);

    // Send email notification to resident
    const resident = db.prepare('SELECT email, name FROM users WHERE id = ?').get(complaint.user_id);
    if (resident) {
      const template = emailTemplates.priorityUpdated({
        complaintTitle: complaint.title,
        oldPriority: oldPriority,
        newPriority: priority,
        adminComment: comment,
        url: process.env.FRONTEND_URL || 'http://localhost:5173'
      });

      sendEmail(resident.email, template.subject, template.html).catch(err =>
        console.error('Failed to send priority update email:', err)
      );
    }

    res.json({ message: 'Priority updated successfully' });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ error: 'Failed to update priority' });
  }
});

// Add admin note
router.post('/complaints/:id/notes', adminOnly, [
  body('note').trim().isLength({ min: 1 }).withMessage('Note required')
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

    const { note } = req.body;

    // Update admin notes
    db.prepare('UPDATE complaints SET admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(note, req.params.id);

    // Add history entry
    addComplaintHistory(req.params.id, 'comment', null, null, req.user.id, note);

    res.json({ message: 'Note added successfully' });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Create notice
router.post('/notices', adminOnly, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority'),
  body('expires_at').optional().isISO8601().withMessage('Invalid expiry date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, priority = 'normal', expires_at } = req.body;

    const result = db.prepare(`
      INSERT INTO notices (title, content, priority, author_id, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content, priority, req.user.id, expires_at || null);

    const notice = db.prepare(`
      SELECT n.*, u.name as author_name, u.role as author_role
      FROM notices n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ?
    `).get(result.lastInsertRowid);

    // Send email notification to all residents
    const residents = db.prepare('SELECT email, name FROM users WHERE role = ?').all('resident');
    
    if (residents.length > 0) {
      const template = emailTemplates.noticeCreated({
        noticeTitle: title,
        content: content,
        priority: priority,
        authorName: req.user.name,
        url: process.env.FRONTEND_URL || 'http://localhost:5173'
      });

      residents.forEach(resident => {
        sendEmail(resident.email, template.subject, template.html).catch(err =>
          console.error('Failed to send notice email:', err)
        );
      });
    }

    res.status(201).json({ data: notice, message: 'Notice created successfully' });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
});

// Get dashboard statistics
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority,
        COUNT(DISTINCT category_id) as categories_used
      FROM complaints
    `).get();

    const recentActivity = db.prepare(`
      SELECT ch.*, c.title as complaint_title, u.name as user_name
      FROM complaint_history ch
      LEFT JOIN complaints c ON ch.complaint_id = c.id
      LEFT JOIN users u ON ch.user_id = u.id
      ORDER BY ch.created_at DESC
      LIMIT 10
    `).all();

    res.json({ 
      stats: {
        total_complaints: stats.total_complaints,
        pending: stats.pending,
        in_progress: stats.in_progress,
        resolved: stats.resolved,
        closed: stats.closed,
        urgent: stats.urgent,
        high_priority: stats.high_priority,
        categories_used: stats.categories_used
      },
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;