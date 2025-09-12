const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    host: process.env.SMTP_EMAIL_HOST, // usually mail.yourdomain.com
    port: 465, // or 587 if using STARTTLS
    secure: true, // true for port 465, false for 587
    auth: {
        user: process.env.SMTP_EMAIL_USER, // your full email address
        pass: process.env.SMTP_EMAIL_PASSWORD, // your email account password
    },
    tls: {
        rejectUnauthorized: false, // sometimes needed for self-signed certs
    },
});

module.exports = transport;
