const connection = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.register = (req, res) => {
    const { fullName, email, phone, collegeName, collegeId } = req.body;
    const profilePic = req.files['profilePic'][0].filename;
    const collegeIdCard = req.files['collegeIdCard'][0].filename;

    const password = crypto.randomBytes(6).toString('hex');
    const hashedPassword = bcrypt.hashSync(password, 8);

    connection.query('INSERT INTO users SET ?', {
        fullName,
        email,
        phone,
        collegeName,
        collegeId,
        profilePic,
        collegeIdCard,
        password: hashedPassword,
    }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error registering user');
        }

        // send email
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Registration Successful - Password Enclosed',
            text: `Dear ${fullName},\n\nYour password is: ${password}\n\nRegards,\nnDMatrix`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            }
        });

        res.status(200).send('Registration successful, password sent via email');
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Email not found');
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send('Invalid password');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({ auth: true, token });
    });
};
