export type Guid = string;

export interface Tenant {
  id: Guid;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Bike {
  id: Guid;
  tenantId: Guid;
  name: string;
  type: string;
  color: string;
  hourlyRate: number;
  status: number;
  conditionNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: Guid;
  tenantId: Guid;
  bikeId: Guid;
  customerId: Guid;
  bookingDate: string;
  startTime?: string | null;
  endTime?: string | null;
  totalPrice?: number | null;
  status: number;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: Guid;
  tenantId: Guid;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}
