
import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

/**
 * ATON TECH SOLUTIONS - BACKEND SERVER
 * Run this locally using: npx ts-node server.ts
 */

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { fullName, email, phone, companyName, message } = req.body;

  // Validation
  if (!fullName || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    // Configure your SMTP transporter (Gmail recommended for starters)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your business email
        pass: process.env.EMAIL_PASS  // Your Google App Password (not your login password)
      }
    });

    // 1. Send Email to Business Owner
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

    // 2. Send Automated Thank You to Customer
    await transporter.sendMail({
      from: `"ATON TECH Solutions" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We've received your inquiry!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #FF6A00;">Hello ${fullName},</h2>
          <p>Thank you for reaching out to <strong>ATON TECH Solutions</strong>.</p>
          <p>Our engineering team has received your message and is currently reviewing your requirements. We will get back to you within 24 hours.</p>
          <br />
          <p>Best Regards,</p>
          <p><strong>The ATON TECH Team</strong></p>
        </div>
      `
    });

    console.log(`[Server] Email processed successfully for: ${email}`);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Server Error]", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ATON TECH Backend running on http://localhost:${PORT}`);
});
