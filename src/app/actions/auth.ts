"use server";

import { createAdminClient } from "@/lib/supabase-server";
import { resend } from "@/lib/resend";
import { headers } from "next/headers";

export async function sendResetPasswordEmail(email: string) {
  try {
    const supabase = createAdminClient();
    const headerList = await headers();
    const origin = headerList.get("origin");

    if (!origin) throw new Error("Could not determine origin");

    // 1. Generate the reset link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${origin}/profile/reset-password`,
      }
    });

    if (error) throw error;

    const resetLink = data.properties.action_link;

    // 2. Send the email using Resend SDK (FAST!)
    console.log('[Reset Password] Sending email via Resend to:', email);
    
    const emailResult = await resend.emails.send({
      from: 'Studentify <onboarding@resend.dev>',
      to: [email],
      subject: '🔓 Reset Your Studentify Password',
      html: `
        <div style="background-color: #f8fafc; padding: 50px 0; font-family: sans-serif;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #0DAC41; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900;">Studentify</h1>
            </div>
            <div style="padding: 40px; text-align: center;">
              <h2 style="color: #0f172a; font-size: 24px; font-weight: 800;">Reset Your Password</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                We received a request to reset your password. Click the button below to get back into your account.
              </p>
              <a href="${resetLink}" style="display: inline-block; background-color: #0DAC41; color: #ffffff; padding: 18px 36px; border-radius: 16px; font-weight: 700; text-decoration: none; font-size: 16px;">
                Reset Password
              </a>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 40px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `
    });

    console.log('[Reset Password] Resend response:', JSON.stringify(emailResult, null, 2));

    if (emailResult.error) {
      console.error('[Reset Password] Resend error:', emailResult.error);
      throw emailResult.error;
    }

    console.log('[Reset Password] Email sent successfully! ID:', emailResult.data?.id);

    return { success: true };
  } catch (error: any) {
    console.error("Error in sendResetPasswordEmail:", error);
    return { success: false, error: error.message };
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error: any) {
    console.error("Error in signUp:", error);
    return { success: false, error: error.message };
  }
}
