
import React, { useState } from 'react';
import { Send, Phone, Mail, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { submitContactForm } from '../services/supabase';
import { sendLeadNotification } from '../services/emailService';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("Sending your message...");
    
    try {
      // 1. Direct Supabase Insert into 'contacts' table
      const dbSuccess = await submitContactForm(formData);
      
      if (dbSuccess) {
        // 2. Trigger Emails (Backend or EmailJS fallback)
        // We run this in the background to ensure fast UX
        sendLeadNotification(formData).catch(err => console.error("Email triggered failed:", err));

        toast.dismiss(loadingToast);
        setIsSuccess(true);
        toast.success("Message Sent Successfully");
        
        // Reset form
        setFormData({ fullName: '', email: '', phone: '', companyName: '', message: '' });
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to save contact. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.dismiss(loadingToast);
      toast.error("Internal server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={64} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black text-deepBlue dark:text-white">Message Sent Successfully</h2>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Your inquiry is in our database!
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Thank you for reaching out to ATON TECH Solutions. Our team will review your message and contact you via email shortly.
            </p>
          </div>
          <button 
            onClick={() => setIsSuccess(false)}
            className="inline-flex items-center space-x-2 text-royalBlue font-black uppercase tracking-widest hover:text-vibrantOrange transition-colors group"
          >
            <span>Send another inquiry</span>
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-display font-bold text-deepBlue dark:text-white">Connect with Experts</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              Partner with ATON TECH Solutions to build your next-generation software. 
              Your data is secured and stored directly in our systems.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 text-royalBlue flex items-center justify-center flex-shrink-0 shadow-inner">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-black text-sm uppercase tracking-widest mb-1">Direct Email</p>
                <a href="mailto:atontechsolutions@gmail.com" className="text-xl font-bold text-deepBlue dark:text-royalBlue hover:underline transition-all">
                  atontechsolutions@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-900/30 text-vibrantOrange flex items-center justify-center flex-shrink-0 shadow-inner">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-black text-sm uppercase tracking-widest mb-1">Contact Line</p>
                <p className="text-xl font-bold text-deepBlue dark:text-white">+91 94208 41427</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 flex items-center justify-center flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-black text-sm uppercase tracking-widest mb-1">Headquarters</p>
                <p className="text-xl font-bold text-deepBlue dark:text-white">Pune, Maharashtra</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-royalBlue/5 rounded-full -mr-16 -mt-16"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-deepBlue dark:text-gray-100 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" required name="fullName" value={formData.fullName} onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-royalBlue focus:ring-4 focus:ring-royalBlue/10 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-deepBlue dark:text-gray-100 uppercase tracking-widest">Email</label>
                <input 
                  type="email" required name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-royalBlue focus:ring-4 focus:ring-royalBlue/10 outline-none transition-all placeholder:text-gray-400"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-deepBlue dark:text-gray-100 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="tel" required name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-royalBlue focus:ring-4 focus:ring-royalBlue/10 outline-none transition-all placeholder:text-gray-400"
                  placeholder="+91..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-deepBlue dark:text-gray-100 uppercase tracking-widest">Company</label>
                <input 
                  type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-royalBlue focus:ring-4 focus:ring-royalBlue/10 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Business Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-deepBlue dark:text-gray-100 uppercase tracking-widest">Your Message</label>
              <textarea 
                rows={4} required name="message" value={formData.message} onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:border-royalBlue focus:ring-4 focus:ring-royalBlue/10 outline-none transition-all resize-none placeholder:text-gray-400"
                placeholder="Describe your requirements briefly..."
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl bg-orange-gradient text-white font-black text-xl shadow-xl flex items-center justify-center space-x-4 transition-all hover:shadow-orange-500/20 hover:-translate-y-1 active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              {!isSubmitting && <Send size={22} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
