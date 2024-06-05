const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const enviarCorreoNotificacion = async (to, subject, text, attachmentPath) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: text,
        attachments: attachmentPath ? [
            {
                filename: 'factura.pdf',
                path: attachmentPath
            }
        ] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email enviado correctamente');
    } catch (error) {
        console.error('Error mandando el email:', error);
    }
};

module.exports = enviarCorreoNotificacion;
