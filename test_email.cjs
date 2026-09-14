const nodemailer = require('nodemailer');

const SMTP_USER = 'sales@newhollandfinancial.com';
const SMTP_PASS = 'SalesNew@2026';

const transporter = nodemailer.createTransport({
  host: 'smtp.larksuite.com',
  port: 465,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

transporter.sendMail({
  from: 'New Holland Financial Group <sales@newhollandfinancial.com>',
  to: 'remytrek@gmail.com',
  subject: 'Welcome to New Holland Financial Group - Test Invite',
  html: '<p>This is a test email verifying the SMTP connection.</p>'
})
.then(info => {
  console.log('Success:', info.response);
})
.catch(err => {
  console.error('Error:', err.message);
});
