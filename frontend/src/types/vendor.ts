import type { VendorProfile } from "@/types/user";

export interface VendorPackage {
  id: number;
  vendor_id: number;
  title: string;
  description: string | null;
  category: string;
  price: number;
  photos: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface VendorReview {
  id: number;
  vendor_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface VendorSearchResult extends VendorProfile {
  packages: VendorPackage[];
}

export interface VendorDetail extends VendorProfile {
  packages: VendorPackage[];
  reviews: VendorReview[];
}

export interface VendorBlockedDate {
  id: number;
  date: string;
  created_at: string;
}
