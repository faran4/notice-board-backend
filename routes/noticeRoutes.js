const express = require('express');
const router = express.Router();
const { getNotices, postNotice, deleteNotice } = require('../controllers/noticeController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', getNotices);
router.post('/', verifyToken, postNotice);
router.delete('/:id', verifyToken, deleteNotice);

module.exports = router;