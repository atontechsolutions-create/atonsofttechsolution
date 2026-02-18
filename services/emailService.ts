
import emailjs from '@emailjs/browser';
import { fetchAppConfig } from './supabase';

/**
 * ATON TECH Hybrid Email Service
 * Prioritizes Vercel API -> Falls back to EmailJS (Serverless)
 */

// Use relative path for production hosting
const BACKEND_URL = "/api/send-email";

interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  autoReplyTemplateId: string | null;
  isMock: boolean;
}

let cachedConfig: EmailJSConfig | null = null;

const getEmailJSConfig = async (): Promise<EmailJSConfig> => {
  if (cachedConfig) return cachedConfig;

  try {
    const [serviceId, templateId, publicKey, autoReplyTemplateId] = await Promise.all([
      fetchAppConfig('emailjs_service_id'),
      fetchAppConfig('emailjs_template_id'),
      fetchAppConfig('emailjs_public_key'),
      fetchAppConfig('emailjs_template_id_autoreply')
    ]);

    if (!serviceId || !templateId || !publicKey) {
      return { serviceId: 'mock', templateId: 'mock', publicKey: 'mock', autoReplyTemplateId: null, isMock: true };
    }

    cachedConfig = { serviceId, templateId, publicKey, autoReplyTemplateId, isMock: false };
    emailjs.init(publicKey);
    return cachedConfig;
  } catch (error) {
    return { serviceId: 'error', templateId: 'error', publicKey: 'error', autoReplyTemplateId: null, isMock: true };
  }
};

export const sendLeadNotification = async (data: any): Promise<boolean> => {
  // 1. Attempt Vercel Backend Delivery
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return true;
    }
  } catch (backendError) {
    console.warn("[Email Service] Backend unavailable, switching to Serverless fallback.");
  }

  // 2. Fallback to EmailJS
  try {
    const config = await getEmailJSConfig();
    if (config.isMock) return true;

    const templateParams = {
      from_name: data.fullName,
      user_email: data.email,
      user_phone: data.phone,
      company_name: data.companyName || 'N/A',
      message: data.message,
      reply_to: data.email,
    };

    const res = await emailjs.send(config.serviceId, config.templateId, templateParams);
    return res.status === 200;
  } catch (error) {
    console.error("[Email Service] All delivery methods failed:", error);
    return false;
  }
};

export const sendAutoReply = async (userEmail: string, userName: string): Promise<boolean> => {
  return true; 
};
