import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  // We'll allow it to be missing for now but warn in logs
  console.warn('RESEND_API_KEY is missing');
}

export const resend = new Resend(process.env.RESEND_API_KEY);
