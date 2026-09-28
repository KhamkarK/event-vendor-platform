import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { addReview } from "@/features/vendors/vendorsApi";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: number;
}

/** Lets a customer rate this vendor from 1 (worst) to 5 (best) stars, with an
 * optional comment. Submitting refreshes the vendor query so the updated
 * rating_avg/rating_count and the new review show up immediately. */
export function AddReviewModal({ isOpen, onClose, vendorId }: AddReviewModalProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: () => addReview(vendorId, rating, comment.trim() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
      toast.success("Thanks for your review!");
      setRating(0);
      setComment("");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Could not submit your review");
    },
  });

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      toast.error("Pick a star rating from 1 to 5");
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rate this vendor">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Your rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 text-accent-400"
                aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
              >
                <Star size={26} fill={value <= (hoverRating || rating) ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Comment (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience with this vendor…"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-150 placeholder:text-neutral-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>

        <Button fullWidth isLoading={mutation.isPending} onClick={handleSubmit}>
          Submit review
        </Button>
      </div>
    </Modal>
  );
}
