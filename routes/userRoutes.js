const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { addUser, getAllUsers, deleteUser } = require("../controllers/userController");

router.post('/add', verifyToken, addUser);
router.get('/', verifyToken, getAllUsers);
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;