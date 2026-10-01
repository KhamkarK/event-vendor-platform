import { apiClient } from "@/lib/axios";
import type { Expense, ExpenseSummary } from "@/types/event";

export async function listExpenses(eventId: number): Promise<ExpenseSummary> {
  const { data } = await apiClient.get<ExpenseSummary>(`/events/${eventId}/expenses`);
  return data;
}

export async function addExpense(
  eventId: number,
  payload: { budget_allocation_id: number; description: string; amount: number }
): Promise<Expense> {
  const { data } = await apiClient.post<Expense>(`/events/${eventId}/expenses`, payload);
  return data;
}
