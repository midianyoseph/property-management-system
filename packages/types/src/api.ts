import { LeaseStatus, MaintenancePriority } from './enums';
import type {
  InvoiceItem,
  Lease,
  MaintenanceTicket,
} from './models';

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface CreateLeaseDto {
  unit_id: Lease['unit_id'];
  tenant_id: Lease['tenant_id'];
  start_date: Lease['start_date'];
  end_date: Lease['end_date'];
  rent_amount: Lease['rent_amount'];
  deposit_amount?: Lease['deposit_amount'];
  status?: LeaseStatus;
}

export interface UpdateLeaseDto {
  status?: LeaseStatus;
  start_date?: Lease['start_date'];
  end_date?: Lease['end_date'];
  rent_amount?: Lease['rent_amount'];
  deposit_amount?: Lease['deposit_amount'];
}

export interface CreateInvoiceItemDto {
  description: InvoiceItem['description'];
  quantity: InvoiceItem['quantity'];
  unit_price: InvoiceItem['unit_price'];
}

export interface CreateInvoiceDto {
  lease_id: string;
  issue_date: Date;
  due_date: Date;
  items: CreateInvoiceItemDto[];
}

export interface CreateMaintenanceTicketDto {
  property_id: MaintenanceTicket['property_id'];
  unit_id?: MaintenanceTicket['unit_id'];
  created_by_tenant_id?: MaintenanceTicket['created_by_tenant_id'];
  title: MaintenanceTicket['title'];
  description: MaintenanceTicket['description'];
  priority: MaintenancePriority;
}
