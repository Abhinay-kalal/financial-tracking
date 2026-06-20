import nodemailer from 'nodemailer';
import axios from 'axios';
import { config } from '../config';
import { sendWhatsAppMessage } from '../config/twilio';

// Nodemailer Transporter Setup
const isSmtpMock = !config.smtp.user || config.smtp.user.includes('mock');

const transporter = isSmtpMock
  ? null
  : nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

export const sendEmail = async (to: string, subject: string, text: string, html?: string): Promise<void> => {
  if (isSmtpMock || !transporter) {
    console.log(`[Nodemailer Mock Email] Sent to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Nodemailer Error:', error);
  }
};

export const sendTelegramMessage = async (message: string): Promise<void> => {
  const isTgMock = !config.telegram.botToken || config.telegram.botToken.includes('mock');

  if (isTgMock) {
    console.log(`[Telegram Bot Mock Alert]: ${message}`);
    return;
  }

  const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: config.telegram.chatId,
      text: message,
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    console.error('Telegram Bot integration failed:', error.message);
  }
};

export const dispatchOverdueAlert = async (
  recipientEmail: string,
  recipientPhone: string,
  clientName: string,
  amount: number,
  dueDate: string
): Promise<void> => {
  const alertText = `Urgent Payment Reminder: A balance of INR ${amount} is outstanding for ${clientName}. The payment was due on ${dueDate}. Please settle at your earliest convenience.`;
  
  // 1. Email Alert
  await sendEmail(recipientEmail, 'Overdue Payment Reminder', alertText);
  
  // 2. Twilio WhatsApp Alert
  if (recipientPhone) {
    await sendWhatsAppMessage(recipientPhone, alertText);
  }
  
  // 3. Telegram Feed Log
  await sendTelegramMessage(`⚠️ <b>Overdue Invoice Alert</b>\nClient: ${clientName}\nOutstanding: INR ${amount}\nDue Date: ${dueDate}`);
};
