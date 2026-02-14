
import React from 'react';

export interface ServiceCardProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
}

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}
