const express = require('express');
const { SKILL_CATEGORIES } = require('../constants/categories');

const router = express.Router();

/**
 * GET /api/categories
 * Return list of predefined categories for frontend dropdowns
 */
router.get('/', (req, res) => {
  res.json({ categories: SKILL_CATEGORIES });
});

module.exports = router;
