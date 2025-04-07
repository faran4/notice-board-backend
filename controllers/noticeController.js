// controllers/noticeController.js
const pool = require('../models/db');

// GET all notices (date-wise)
const getNotices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.title, n.content, n.created_at, u.username AS posted_by
       FROM notices n
       JOIN users u ON n.posted_by = u.id
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
};

// POST a new notice
const postNotice = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== 'teacher' && userRole !== 'admin') {
    return res.status(403).json({ error: 'Only teachers and admin can post notices' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notices (title, content, posted_by) VALUES ($1, $2, $3) RETURNING *',
      [title, content, userId]
    );
    
    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
    console.log(userResult);
    
    const notice = result.rows[0];
    notice.posted_by = userResult.rows[0].username; 

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post notice' });
  }
};

// DELETE a notice
const deleteNotice = async (req, res) => {
  const noticeId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const result = await pool.query('SELECT * FROM notices WHERE id = $1', [noticeId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    const notice = result.rows[0];
    const isOwner = notice.posted_by === userId;

    if (userRole !== 'admin' && !isOwner) {
      return res.status(403).json({ error: 'Unauthorized to delete this notice' });
    }

    await pool.query('DELETE FROM notices WHERE id = $1', [noticeId]);
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notice' });
  }
};

module.exports = {
  getNotices,
  postNotice,
  deleteNotice,
};
