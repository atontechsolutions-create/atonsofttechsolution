
import { ContactFormData } from '../types';

/**
 * Supabase Connection Details
 */
const SUPABASE_URL = 'https://dyjtqvhuuuqszocmaozk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_b2SsfZPqClCMhnkfdbniuw_M7yc4lMN';

/**
 * Submits the contact form data to the Supabase 'leads' table.
 */
export const submitContactForm = async (data: ContactFormData): Promise<boolean> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName,
        message: data.message,
        project_name: 'atontechsolutions'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Submission failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Network error during contact submission:', error);
    return false;
  }
};

/**
 * Fetches configuration values from the app_config table.
 */
export const fetchAppConfig = async (key: string): Promise<string | null> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_config?key=eq.${key}&select=value`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.length > 0 ? data[0].value : null;
  } catch (error) {
    console.error(`Error fetching config for ${key}:`, error);
    return null;
  }
};
