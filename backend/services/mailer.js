const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null; // email disabled
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return transporter;
}

async function sendMail(to, subject, html) {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || 'no-reply@skillswap.local';
  if (!t) {
    console.log('[MAIL:disabled]', { to, subject });
    return { disabled: true };
  }
  return t.sendMail({ from, to, subject, html });
}

module.exports = { sendMail };
