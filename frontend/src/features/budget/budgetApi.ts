import { apiClient } from "@/lib/axios";
import type { BudgetAllocation, BudgetSummary } from "@/types/event";

export async function getBudgetSummary(eventId: number): Promise<BudgetSummary> {
  const { data } = await apiClient.get<BudgetSummary>(`/events/${eventId}/budget`);
  return data;
}

export async function updateAllocation(
  eventId: number,
  allocationId: number,
  payload: Partial<Pick<BudgetAllocation, "allocated_amount" | "spent_amount" | "sort_order">>
): Promise<BudgetAllocation> {
  const { data } = await apiClient.patch<BudgetAllocation>(`/events/${eventId}/budget/${allocationId}`, payload);
  return data;
}

export async function reorderAllocations(
  eventId: number,
  allocations: { id: number; sort_order: number; allocated_amount: number }[]
): Promise<BudgetAllocation[]> {
  const { data } = await apiClient.post<BudgetAllocation[]>(`/events/${eventId}/budget/reorder`, { allocations });
  return data;
}
