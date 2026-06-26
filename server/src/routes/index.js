const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/departments', require('./departmentRoutes'));
router.use('/staff', require('./staffRoutes'));
router.use('/news', require('./newsRoutes'));
router.use('/downloads', require('./downloadRoutes'));
router.use('/gallery', require('./galleryRoutes'));
router.use('/content', require('./contentRoutes'));
router.use('/uploads', require('./uploadRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/contact-submissions', require('./contactRoutes'));
router.use('/services', require('./serviceRoutes'));

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
