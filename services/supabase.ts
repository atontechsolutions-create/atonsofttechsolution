
import { createClient } from '@supabase/supabase-js';
import { ContactFormData } from '../types';

/**
 * Supabase Production Configuration
 */
const SUPABASE_URL = 'https://dyjtqvhuuuqszocmaozk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_b2SsfZPqClCMhnkfdbniuw_M7yc4lMN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Submits the contact form data to the Supabase 'contacts' table.
 * Specifically maps UI fields to the requested table schema: name, email, message.
 */
export const submitContactForm = async (data: ContactFormData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contacts')
      .insert([
        { 
          name: data.fullName, 
          email: data.email, 
          message: data.message 
        }
      ]);

    if (error) {
      console.error('Supabase Error:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Network error during Supabase submission:', error);
    return false;
  }
};

/**
 * Fetches configuration values from the app_config table.
 */
export const fetchAppConfig = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) return null;
    return data.value;
  } catch (error) {
    console.error(`Error fetching config for ${key}:`, error);
    return null;
  }
};
