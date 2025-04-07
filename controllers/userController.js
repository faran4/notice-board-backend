const bcrypt = require('bcryptjs');
const pool = require('../models/db');

const addUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const userRole = req.user.role;

  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Only admin can add users' });
  }

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, role.toLowerCase()]
    );

    res.status(201).json({ message: 'User added', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
};

const getAllUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admin can view users' });
  }

  try {
    const result = await pool.query('SELECT id, username, email, role FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRole = result.rows[0].role;

    if (userRole === 'admin') {
      return res.status(403).json({ error: 'Admin user cannot be deleted' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = { addUser, getAllUsers, deleteUser };
