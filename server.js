const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const bcrypt = require('bcryptjs');

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
  }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notices", noticeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// bcrypt.hash('admin123', 10).then(console.log);