import { Bike, Booking, Tenant, Customer } from "@/types";

const defaultBaseUrl = "http://localhost:5000";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || defaultBaseUrl;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API ${response.status}: ${message}`);
  }

  return (await response.json()) as T;
}

export async function getTenants() {
  return apiFetch<Tenant[]>("/api/tenants");
}

export async function getBikes(tenantId: string) {
  return apiFetch<Bike[]>(`/api/tenants/${tenantId}/bikes`);
}

export async function getBookings(tenantId: string) {
  return apiFetch<Booking[]>(`/api/tenants/${tenantId}/bookings`);
}

export async function getCustomers(tenantId: string) {
  return apiFetch<Customer[]>(`/api/tenants/${tenantId}/customers`);
}

export async function createTenant(payload: { name: string; slug: string }) {
  return apiFetch<Tenant>("/api/tenants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createBike(
  tenantId: string,
  payload: { name: string; type: string; color: string; hourlyRate: number; conditionNote?: string }
) {
  return apiFetch<Bike>(`/api/tenants/${tenantId}/bikes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createBooking(
  tenantId: string,
  payload: {
    bikeId: string;
    customerId: string;
    bookingDate: string;
    startTime?: string | null;
    endTime?: string | null;
    totalPrice?: number | null;
    remark?: string | null;
  }
) {
  return apiFetch<Booking>(`/api/tenants/${tenantId}/bookings`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCustomer(
  tenantId: string,
  payload: { name: string; email?: string; phone?: string }
) {
  return apiFetch<Customer>(`/api/tenants/${tenantId}/customers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
