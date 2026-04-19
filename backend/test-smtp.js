const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.larksuite.com',
  port: 465,
  secure: true,
  auth: { user: 'sales@newhollandfinancial.com', pass: '0JmzhnYLWPXvePcp' },
});
transporter.verify().then(console.log).catch(console.error);
