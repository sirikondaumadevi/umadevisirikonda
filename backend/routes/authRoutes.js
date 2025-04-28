const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');

// file upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/register', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'collegeIdCard', maxCount: 1 }
]), authController.register);

router.post('/login', authController.login);

module.exports = router;
