// require('dotenv').config();
// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   secure: true,
//   auth: {
//     user: 'imamaan22khan@gmail.com',
//     pass: process.env.GOOGLE_APP_PASSWORD,
//   },
// });

// // Verify the connection configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Error connecting to email server:', error);
//   } else {
//     console.log('Email server is ready to send messages');
//   }
// });

// // Function to send email
// const sendEmail = async (to, subject, text, html) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"AUTH-COM" <${process.env.GOOGLE_USER}>`, // sender address
//       to, // list of receivers
//       subject, // Subject line
//       text, // plain text body
//       html,
//     });

//     console.log('Message sent: %s', info.messageId);
//     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// module.exports = sendEmail;

require("dotenv").config();

const SibApiV3Sdk = require("sib-api-v3-sdk");

// ======================================================
// BREVO CLIENT
// ======================================================

const defaultClient =
  SibApiV3Sdk.ApiClient.instance;

// Brevo API Key
defaultClient.authentications[
  "api-key"
].apiKey = process.env.BREVO_API_KEY;

// ======================================================
// BREVO TRANSACTIONAL EMAIL API
// ======================================================

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();

// ======================================================
// SEND EMAIL
// ======================================================

const sendEmail = async (
  to,
  subject,
  text,
  html
) => {
  try {
    const sendSmtpEmail =
      new SibApiV3Sdk.SendSmtpEmail();

    // Sender
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || "VYBE",
      email: process.env.BREVO_SENDER_EMAIL,
    };

    // Receiver
    sendSmtpEmail.to = [
      {
        email: to,
      },
    ];

    // Subject
    sendSmtpEmail.subject = subject;

    // Plain text
    sendSmtpEmail.textContent = text;

    // HTML
    sendSmtpEmail.htmlContent = html;

    // Send
    const response =
      await apiInstance.sendTransacEmail(
        sendSmtpEmail
      );

    console.log(
      "✅ Brevo email sent successfully"
    );

    console.log(
      "Brevo response:",
      response
    );

    return response;

  } catch (error) {

    console.error(
      "❌ Brevo email sending failed"
    );

    console.error(
      error.response?.body ||
      error.response?.data ||
      error.message ||
      error
    );

    // VERY IMPORTANT
    // Don't silently continue.
    throw error;
  }
};

module.exports = sendEmail;