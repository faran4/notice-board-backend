const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../models/db");

const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (role.toLowerCase() === 'admin') {
    return res.status(403).json({ error: 'Cannot self-register as admin' });
  }

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Email or username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role",
      [username, email, hashedPassword, role.toLowerCase()]
    );

    res.status(201).json({ message: "User registered", user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
