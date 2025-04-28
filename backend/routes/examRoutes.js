const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

router.get('/courses', examController.listCourses);
router.get('/tests/:courseId', examController.listTests);
router.get('/start-test/:testId', examController.startTest);
router.post('/submit-test', examController.submitTest);

module.exports = router;
