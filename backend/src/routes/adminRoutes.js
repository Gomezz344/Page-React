const express = require('express');

const {
  getDashboardStats
} = require('../controllers/adminController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get(
  '/stats',
  authMiddleware,
  roleMiddleware(1),
  getDashboardStats
);

module.exports = router;