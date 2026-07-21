import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const isMock = 
    !process.env.SMTP_HOST || 
    process.env.SMTP_HOST.includes('mailtrap') && process.env.SMTP_USER === 'mock_user';

  if (isMock) {
    console.log('==================================================');
    console.log('[Email Log (MOCK ACTIVE)]');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.message}`);
    console.log('==================================================');
    return { mock: true, messageId: 'mock_message_id_12345' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'Prizm'} <${process.env.EMAIL_FROM || 'noreply@prizm.dev'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Service] Email sent to ${options.email}: ${info.messageId}`);
  return info;
};

export default sendEmail;
