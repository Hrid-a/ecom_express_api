const nodemailer = require("nodemailer");

const mailSend = async (option) => {

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT_KEY,
        secure: true,
        auth: {
            user: process.env.SMTP_AUTH_USER,
            pass: process.env.SMTP_AUTH_PASS,
        },
    });


    const options = {
        from: 'ahmed@dev.com', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        text: option.message, // plain text body
    }

    await transporter.sendMail();
}

module.exports = mailSend;