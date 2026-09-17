export type EventType = "marriage" | "birthday" | "corporate";

export interface EventItem {
  id: number;
  user_id: number;
  name: string;
  event_type: EventType;
  event_date: string;
  location: string;
  total_budget: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetAllocation {
  id: number;
  event_id: number;
  name: string;
  icon: string;
  allocated_amount: number;
  spent_amount: number;
  sort_order: number;
  updated_at: string;
}

export interface BudgetSummary {
  total_budget: number;
  total_allocated: number;
  total_spent: number;
  remaining: number;
  is_over_budget: boolean;
  categories: BudgetAllocation[];
}
