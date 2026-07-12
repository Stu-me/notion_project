const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');

const sendEmail = asyncHandler(async (options) =>{
    //  1) create transporter that is responsible for creating the connection 
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', 
        port:587, // standard smtp submission port 
        secure: false,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        }
    });

    // EMAIL content
    const mailOptions =  {
        from:process.env.EMAIL_USER,
        to:options.email,
        subject:options.subject,
        text:options.text
    }

    // send the email 
    await transporter.sendMail(mailOptions);
})

module.exports = sendEmail;