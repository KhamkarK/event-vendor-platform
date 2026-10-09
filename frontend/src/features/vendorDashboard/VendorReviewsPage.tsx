import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, ClipboardList, LayoutDashboard, Package, Pencil, Star, Wallet } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { Sidebar, type SidebarLink } from "@/components/layout/Sidebar";
import { editReview } from "@/features/admin/adminApi";
import { getMyReviews } from "@/features/vendorDashboard/vendorDashboardApi";
import { useAuthStore } from "@/store/authStore";
import type { VendorReview } from "@/types/vendor";

const sidebarLinks: SidebarLink[] = [
  { label: "Overview", to: "/vendor-dashboard", icon: LayoutDashboard, end: true },
  { label: "Calendar", to: "/vendor-dashboard/calendar", icon: CalendarCheck },
  { label: "Packages", to: "/vendor-dashboard/packages", icon: Package },
  { label: "Quotations", to: "/vendor-dashboard/quotations", icon: ClipboardList },
  { label: "Ledger", to: "/vendor-dashboard/ledger", icon: Wallet },
  { label: "Reviews", to: "/vendor-dashboard/reviews", icon: Star },
];

const editSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});
type EditFormValues = z.infer<typeof editSchema>;

export function VendorReviewsPage() {
  const { isImpersonating } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useQuery({ queryKey: ["vendor-reviews"], queryFn: getMyReviews });
  const [editingReview, setEditingReview] = useState<VendorReview | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  const editMutation = useMutation({
    mutationFn: (values: EditFormValues) => editReview(editingReview!.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-reviews"] });
      toast.success("Review updated");
      setEditingReview(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Could not update review");
    },
  });

  const openEditModal = (review: VendorReview) => {
    setEditingReview(review);
    reset({ rating: review.rating, comment: review.comment ?? "" });
  };

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
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-accent-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      {isImpersonating && (
                        <button
                          onClick={() => openEditModal(review)}
                          className="shrink-0 rounded-full p-1 text-neutral-300 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Edit review"
                          title="Edit review (admin only)"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
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

      <Modal isOpen={!!editingReview} onClose={() => setEditingReview(null)} title="Edit review (admin only)">
        <form onSubmit={handleSubmit((values) => editMutation.mutate(values))} className="flex flex-col gap-4">
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Rating (1-5)</label>
            <select
              className="h-[42px] w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-all duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              {...register("rating")}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
            {errors.rating?.message && <p className="mt-1 text-xs font-medium text-red-500">{errors.rating.message}</p>}
          </div>
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Comment</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-150 placeholder:text-neutral-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              {...register("comment")}
            />
          </div>
          <Button type="submit" isLoading={isSubmitting || editMutation.isPending} fullWidth>
            Save changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
