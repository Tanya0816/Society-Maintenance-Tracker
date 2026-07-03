const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// Get all notices
router.get('/', (req, res) => {
  try {
    const notices = db.prepare(`
      SELECT n.*, u.name as adminName
      FROM notices n
      JOIN users u ON n.adminId = u.id
      ORDER BY n.createdAt DESC
    `).all();

    res.json({
      data: notices.map(notice => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        createdAt: notice.createdAt,
        admin: {
          name: notice.adminName
        }
      }))
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

// Get single notice
router.get('/:id', (req, res) => {
  try {
    const notice = db.prepare(`
      SELECT n.*, u.name as adminName
      FROM notices n
      JOIN users u ON n.adminId = u.id
      WHERE n.id = ?
    `).get(req.params.id);

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({
      data: {
        id: notice.id,
        title: notice.title,
        content: notice.content,
        createdAt: notice.createdAt,
        admin: {
          name: notice.adminName
        }
      }
    });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ error: 'Failed to fetch notice' });
  }
});

module.exports = router;