const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.larksuite.com',
  port: 465,
  secure: true,
  auth: { user: 'sales@newhollandfinancial.com', pass: 'NewHollandSales26' },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
