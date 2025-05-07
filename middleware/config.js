const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "adeelparacha186@gmail.com",
    pass: "kgzycpmcugjrkzec",
  },
  debug: true,
});

module.exports = transporter;
