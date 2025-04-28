const connection = require('../config/db');
const nodemailer = require('nodemailer');

exports.listCourses = (req, res) => {
    connection.query('SELECT * FROM courses', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching courses');
        }
        res.status(200).json(results);
    });
};

exports.listTests = (req, res) => {
    const { courseId } = req.params;
    connection.query('SELECT * FROM tests WHERE courseId = ?', [courseId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching tests');
        }
        res.status(200).json(results);
    });
};

exports.startTest = (req, res) => {
    const { testId } = req.params;
    connection.query('SELECT * FROM questions WHERE testId = ?', [testId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching questions');
        }
        res.status(200).json(results);
    });
};

exports.submitTest = (req, res) => {
    const { userId, testId, answers } = req.body;

    // Save the answers (for simplicity, saving as JSON string)
    connection.query('INSERT INTO submissions SET ?', {
        userId,
        testId,
        answers: JSON.stringify(answers),
    }, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error submitting test');
        }

        // Fetch user email to send confirmation
        connection.query('SELECT email, fullName FROM users WHERE id = ?', [userId], (err2, userResult) => {
            if (err2) {
                console.error(err2);
                return res.status(500).send('Error fetching user info');
            }
            const user = userResult[0];

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            let mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Test Submission Confirmation',
                text: `Dear ${user.fullName},\n\nYour test has been successfully submitted.\nCourse Name: GATE - 2025\nTest Name: Test - 1\n\nBest Regards,\nnDMatrix`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                }
            });

            res.status(200).send('Test submitted and email sent');
        });
    });
};
