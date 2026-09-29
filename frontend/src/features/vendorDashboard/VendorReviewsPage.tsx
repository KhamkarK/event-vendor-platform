import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, ClipboardList, LayoutDashboard, Package, Star, Wallet } from "lucide-react";

import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { getMyReviews } from "@/features/vendorDashboard/vendorDashboardApi";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Packages", to: "/vendor-dashboard/packages", icon: Package },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
  { label: "Reviews", to: "/vendor-dashboard/reviews", icon: Star },
];

export function VendorReviewsPage() {
  const { data: reviews, isLoading } = useQuery({ queryKey: ["vendor-reviews"], queryFn: getMyReviews });

  return (
    <div className="flex gap-8">
      <Sidebar title="Vendor" links={sidebarLinks} />
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">Reviews</h1>
        <p className="mt-1 text-sm text-neutral-500">
          What customers have said about you. Only an admin can remove a review — you can't edit or delete these yourself.
        </p>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <RangoliSpinner label="Loading reviews…" />
            </div>
          ) : !reviews || reviews.length === 0 ? (
            <EmptyState icon={Star} title="No reviews yet" description="Reviews from customers you've worked with will show up here." />
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-neutral-800">{review.reviewer_name}</p>
                    <div className="flex items-center gap-1 text-accent-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>}
                  <p className="mt-2 text-xs text-neutral-400">
                    {new Date(review.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
