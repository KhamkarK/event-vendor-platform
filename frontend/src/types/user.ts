export type UserRole = "customer" | "vendor" | "admin";

export interface VendorProfile {
  id: number;
  business_name: string;
  category: string;
  description: string | null;
  location: string | null;
  documents: string[] | null;
  commission_rate: number;
  rating_avg: number;
  rating_count: number;
  is_approved: boolean;
  is_blocked: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  mobile: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  vendor_profile: VendorProfile | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}
