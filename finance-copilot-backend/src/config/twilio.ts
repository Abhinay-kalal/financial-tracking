import twilio from 'twilio';
import { config } from './index';

const isMock = !config.twilio.accountSid || config.twilio.accountSid.includes('mock');

const twilioClient = isMock
  ? null
  : twilio(config.twilio.accountSid, config.twilio.authToken);

export const sendWhatsAppMessage = async (to: string, body: string): Promise<string> => {
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  if (isMock || !twilioClient) {
    console.log(`[Twilio WhatsApp Mock] Sent to ${formattedTo}: ${body}`);
    return `mock_sid_${Date.now()}`;
  }

  try {
    const message = await twilioClient.messages.create({
      from: config.twilio.whatsappFrom,
      to: formattedTo,
      body,
    });
    return message.sid;
  } catch (error: any) {
    console.error('Twilio WhatsApp error:', error);
    throw new Error(`Twilio WhatsApp Failed: ${error.message}`);
  }
};
