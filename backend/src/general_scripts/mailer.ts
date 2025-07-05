import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL as string,
    pass: process.env.GMAIL_PASS as string,
  },
});

// Define the function signature for better type safety
const sendEmail = async (
  to: string,
  subject: string,
  text: string,
): Promise<void> => {
  const mailOptions = {
    from: process.env.GMAIL as string,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
