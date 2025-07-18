
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  tags: string[];
  notes: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  start: Date;
  end: Date;
  estimatedDuration: number; // in minutes
  status: 'pending_confirmation' | 'confirmation_sent' | 'confirmed' | 'cancelled';
  confirmationToken?: string;
}

export interface Campaign {
  id:string;
  name: string;
  targetSegment: string;
  channel: 'email' | 'sms';
  message: string;
  sentDate: string;
  status: 'sent' | 'draft';
  stats: {
    sent: number;
    opened: number;
    clicks: number;
  };
}

export enum UserRole {
    ADMIN = 'admin',
    CLIENT = 'client',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    businessName: string;
    plan: 'Gratis' | 'Básico' | 'Pro';
}

export interface Plan {
  name: 'Gratis' | 'Básico' | 'Pro';
  price: number;
  features: string[];
  limits: {
    appointments: number | 'unlimited';
    clients: number | 'unlimited';
    emails: number | 'unlimited';
  };
}

export interface ReminderRule {
  id: string;
  serviceName: string;
  frequencyDays: number;
  messageTemplate: string;
}
