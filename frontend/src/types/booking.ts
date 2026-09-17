export type BookingStatus = "interested" | "quote_requested" | "quoted" | "confirmed" | "completed" | "cancelled";
export type QuotationStatus = "pending" | "accepted" | "rejected";

export interface Quotation {
  id: number;
  booking_id: number;
  vendor_id: number;
  amount: number;
  details: string | null;
  status: QuotationStatus;
  created_at: string;
}

export interface Booking {
  id: number;
  event_id: number;
  vendor_id: number;
  package_id: number | null;
  budget_category_id: number | null;
  status: BookingStatus;
  total_amount: number;
  advance_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** Denormalized by the backend so the comparison view doesn't need per-booking lookups. */
  vendor_name: string | null;
  package_title: string | null;
  quotations: Quotation[];
}

export interface WishlistItem {
  id: number;
  user_id: number;
  vendor_id: number;
  created_at: string;
}

export interface LedgerEntry {
  id: number;
  vendor_id: number;
  booking_id: number | null;
  entry_type: "credit" | "debit";
  amount: number;
  description: string | null;
  created_at: string;
}

export interface Invoice {
  id: number;
  vendor_id: number;
  booking_id: number;
  invoice_number: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  due_date: string | null;
  created_at: string;
}

export interface VendorLedgerSummary {
  total_credit: number;
  total_debit: number;
  net_balance: number;
  pending_dues: number;
  entries: LedgerEntry[];
  invoices: Invoice[];
}
