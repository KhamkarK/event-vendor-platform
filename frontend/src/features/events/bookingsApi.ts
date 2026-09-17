import { apiClient } from "@/lib/axios";
import type { Booking } from "@/types/booking";

export async function listEventBookings(eventId: number): Promise<Booking[]> {
  const { data } = await apiClient.get<Booking[]>(`/bookings/by-event/${eventId}`);
  return data;
}
