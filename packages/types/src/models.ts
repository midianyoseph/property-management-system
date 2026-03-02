import {
  InvoiceStatus,
  LeaseStatus,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentStatus,
  UserRole,
  WaitingListStatus,
} from './enums';

// Core domain models mirroring database tables

export interface User {
  id: string; // UUID
  email: string;
  full_name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Property {
  id: string; // UUID
  name: string;
  description?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  created_at: Date;
  updated_at: Date;
}

export interface Unit {
  id: string; // UUID
  property_id: string; // UUID
  unit_number: string;
  floor?: number;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  rent_amount: number; // NUMERIC
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Tenant {
  id: string; // UUID
  user_id: string; // UUID
  primary_phone: string;
  secondary_phone?: string;
  date_of_birth?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Lease {
  id: string; // UUID
  unit_id: string; // UUID
  tenant_id: string; // UUID
  status: LeaseStatus;
  start_date: Date; // TIMESTAMPTZ
  end_date: Date; // TIMESTAMPTZ
  rent_amount: number; // NUMERIC
  deposit_amount?: number; // NUMERIC
  created_at: Date;
  updated_at: Date;
}

export interface LeaseDocument {
  id: string; // UUID
  lease_id: string; // UUID
  name: string;
  url: string;
  uploaded_by_user_id: string; // UUID
  created_at: Date;
}

export interface Invoice {
  id: string; // UUID
  lease_id: string; // UUID
  number: string;
  issue_date: Date; // TIMESTAMPTZ
  due_date: Date; // TIMESTAMPTZ
  status: InvoiceStatus;
  total_amount: number; // NUMERIC
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  id: string; // UUID
  invoice_id: string; // UUID
  description: string;
  quantity: number; // NUMERIC
  unit_price: number; // NUMERIC
  total: number; // NUMERIC
}

export interface Payment {
  id: string; // UUID
  invoice_id: string; // UUID
  amount: number; // NUMERIC
  status: PaymentStatus;
  method: string;
  reference?: string;
  paid_at?: Date; // TIMESTAMPTZ
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceTicket {
  id: string; // UUID
  property_id: string; // UUID
  unit_id?: string; // UUID
  created_by_tenant_id?: string; // UUID
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  opened_at: Date; // TIMESTAMPTZ
  resolved_at?: Date; // TIMESTAMPTZ
  closed_at?: Date; // TIMESTAMPTZ
  created_at: Date;
  updated_at: Date;
}

export interface MaintenanceComment {
  id: string; // UUID
  ticket_id: string; // UUID
  author_user_id: string; // UUID
  message: string;
  created_at: Date; // TIMESTAMPTZ
}

export interface WaitingListEntry {
  id: string; // UUID
  property_id: string; // UUID
  unit_type?: string;
  full_name: string;
  email: string;
  phone: string;
  status: WaitingListStatus;
  source?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string; // UUID
  user_id: string; // UUID
  type: string;
  title: string;
  body: string;
  read_at?: Date; // TIMESTAMPTZ
  created_at: Date; // TIMESTAMPTZ
}
