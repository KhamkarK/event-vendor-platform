import { apiClient } from "@/lib/axios";
import type { Booking, BookingStatus, Invoice, LedgerEntry, Quotation, VendorLedgerSummary } from "@/types/booking";
import type { VendorBlockedDate } from "@/types/vendor";

export async function listVendorBookings(): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>("/bookings/vendor/me");
  return data;
}

export async function updateBookingStatus(bookingId: number, status: BookingStatus): Promise<Booking> {
  const { data } = await apiClient.patch<Booking>(`/bookings/${bookingId}/status`, { status });
  return data;
}

export async function respondToQuotation(quotationId: number, status: "accepted" | "rejected"): Promise<Quotation> {
  const { data } = await apiClient.patch<Quotation>(`/bookings/quotations/${quotationId}`, { status });
  return data;
}

export async function getMyLedger(): Promise<VendorLedgerSummary> {
  const { data } = await apiClient.get<VendorLedgerSummary>("/ledger/me");
  return data;
}

export async function addLedgerEntry(payload: {
  entry_type: "credit" | "debit";
  amount: number;
  description?: string;
  booking_id?: number;
}): Promise<LedgerEntry> {
  const { data } = await apiClient.post<LedgerEntry>("/ledger/me/entries", payload);
  return data;
}

export async function createInvoice(payload: { booking_id: number; amount: number; due_date?: string }): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>("/ledger/me/invoices", payload);
  return data;
}

export async function markInvoicePaid(invoiceId: number): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`/ledger/me/invoices/${invoiceId}/mark-paid`);
  return data;
}

export async function listMyBlockedDates(): Promise<VendorBlockedDate[]> {
  const { data } = await apiClient.get<VendorBlockedDate[]>("/vendors/me/blocked-dates");
  return data;
}

export async function blockDate(date: string): Promise<VendorBlockedDate> {
  const { data } = await apiClient.post<VendorBlockedDate>("/vendors/me/blocked-dates", { date });
  return data;
}

export async function unblockDate(blockedId: number): Promise<void> {
  await apiClient.delete(`/vendors/me/blocked-dates/${blockedId}`);
}
