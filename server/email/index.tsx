import { pretty, render } from '@react-email/render';
import { type CreateEmailResponseSuccess, type ErrorResponse, Resend } from 'resend';
import env from '../lib/env';
import VerifyCodeEmail from './template/verify-code-email';

const emailInstance = new Resend(env.EMAIL_RESEND_API_KEY);

export const sendVerificationEmail = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<{
  data: CreateEmailResponseSuccess | null;
  error: ErrorResponse | null;
}> => {
  const htmlTemplate = await pretty(await render(<VerifyCodeEmail verificationCode={otp} />));

  const { data, error } = await emailInstance.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email',
    html: htmlTemplate,
  });

  if (error) {
    console.error(error);
  }

  return { data, error };
};
