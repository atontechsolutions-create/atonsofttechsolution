
import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { fullName, email, phone, companyName, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 1. Lead Notification to Owner
    await transporter.sendMail({
      from: `"${fullName}" <${email}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Lead: ${fullName} - ATON TECH Solutions`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1E5EFF;">New Business Inquiry</h2>
          <hr />
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
          <div style="margin-top: 20px; padding: 15px; background: #f4f4f4; border-radius: 8px;">
            <strong>Message:</strong><br />
            ${message}
          </div>
        </div>
      `
    });

    // 2. Automated Thank You
    await transporter.sendMail({
      from: `"ATON TECH Solutions" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We've received your inquiry!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #FF6A00;">Hello ${fullName},</h2>
          <p>Thank you for reaching out to <strong>ATON TECH Solutions</strong>.</p>
          <p>Our team has received your message. We will get back to you within 24 hours.</p>
          <br />
          <p>Best Regards,</p>
          <p><strong>The ATON TECH Team</strong></p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Vercel Function Error]", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
