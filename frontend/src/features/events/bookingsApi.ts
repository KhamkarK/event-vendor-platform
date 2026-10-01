import { apiClient } from "@/lib/axios";
import type { Booking, Quotation } from "@/types/booking";

export async function listEventBookings(eventId: number): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>(`/bookings/by-event/${eventId}`);
  return data;
}

/** Customer accepts/rejects a quotation the vendor sent for one of their bookings. */
export async function respondToQuotation(quotationId: number, status: "accepted" | "rejected"): Promise<Quotation> {
  const { data } = await apiClient.patch<Quotation>(`/bookings/quotations/${quotationId}`, { status });
  return data;
}
