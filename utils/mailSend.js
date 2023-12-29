const nodemailer = require("nodemailer");

const mailSend = async ({ email, subject, message }) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT_KEY,
        // secure: true,
        auth: {
            user: process.env.SMTP_AUTH_USER,
            pass: process.env.SMTP_AUTH_PASS,
        },
    });


    const options = {
        from: process.env.SMTP_AUTH_USER, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
    }

    await transporter.sendMail(options);
}

module.exports = mailSend;