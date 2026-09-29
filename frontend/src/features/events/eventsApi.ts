import { apiClient } from "@/lib/axios";
import type { EventItem, EventType } from "@/types/event";

export interface CreateEventPayload {
  name: string;
  event_type: EventType;
  event_date: string;
  location: string;
  total_budget: number;
  guest_count: number;
}

export async function listEvents(): Promise<EventItem[]> {
  const { data } = await apiClient.get<EventItem[]>("/events");
  return data;
}

export async function getEvent(eventId: number): Promise<EventItem> {
  const { data } = await apiClient.get<EventItem>(`/events/${eventId}`);
  return data;
}

export async function createEvent(payload: CreateEventPayload): Promise<EventItem> {
  const { data } = await apiClient.post<EventItem>("/events", payload);
  return data;
}

export async function updateEvent(eventId: number, payload: Partial<Pick<EventItem, "total_budget">>): Promise<EventItem> {
  const { data } = await apiClient.patch<EventItem>(`/events/${eventId}`, payload);
  return data;
}

export async function deleteEvent(eventId: number): Promise<void> {
  await apiClient.delete(`/events/${eventId}`);
}
