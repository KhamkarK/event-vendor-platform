import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Heart, Link as LinkIcon, MapPin, Package, Phone, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/common/Button";
import { BlockedDatesList } from "@/components/common/BlockedDatesList";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { RangoliSpinner } from "@/components/common/RangoliSpinner";
import { VerifiedRibbon } from "@/components/common/VerifiedRibbon";
import { deleteReview } from "@/features/admin/adminApi";
import { PrimeMembershipModal } from "@/components/layout/PrimeMembershipModal";
import { AddReviewModal } from "@/features/vendors/AddReviewModal";
import { RequestBookingModal } from "@/features/vendors/RequestBookingModal";
import { getVendorAvailability, getVendorDetail, toggleWishlist } from "@/features/vendors/vendorsApi";
import { useAuthStore } from "@/store/authStore";

export function VendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const id = Number(vendorId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [wishlisted, setWishlisted] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showPrimeModal, setShowPrimeModal] = useState(false);

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getVendorDetail(id),
    enabled: !!id,
  });
  const { data: unavailableDates } = useQuery({
    queryKey: ["vendor-availability", id],
    queryFn: () => getVendorAvailability(id),
    enabled: !!id,
  });

  const handleBookClick = () => {
    if (!isAuthenticated) {
      toast.error("Log in to request a booking");
      return;
    }
    setShowBookingModal(true);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Log in to save vendors to your wishlist");
      return;
    }
    const result = await toggleWishlist(id);
    setWishlisted(result.wishlisted);
    toast.success(result.wishlisted ? "Added to wishlist" : "Removed from wishlist");
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.error("Log in to write a review");
      return;
    }
    setShowReviewModal(true);
  };

  const deleteReviewMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      toast.success("Review deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail ?? "Could not delete review");
    },
  });

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm("Delete this review? This cannot be undone.")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  if (isLoading || !vendor) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RangoliSpinner label="Loading vendor…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={15} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-brand-gradient p-8 text-white shadow-glow">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{vendor.business_name}</h1>
              {vendor.is_approved && <VerifiedRibbon />}
            </div>
            <p className="mt-1 text-white/80">{vendor.category}</p>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-white text-white" /> {vendor.rating_avg.toFixed(1)} ({vendor.rating_count} reviews)
              </span>
              {vendor.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {vendor.location}
                </span>
              )}
              {vendor.contact_number ? (
                <span className="flex items-center gap-1">
                  <Phone size={14} /> {vendor.contact_number}
                </span>
              ) : (
                <button
                  onClick={() => setShowPrimeModal(true)}
                  className="flex items-center gap-1 text-white/80 underline-offset-2 hover:underline"
                >
                  <Crown size={14} /> Prime members see contact number
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleWishlist}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
          >
            <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>
        {vendor.description && <p className="mt-4 max-w-2xl text-sm text-white/90">{vendor.description}</p>}
      </motion.div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">Packages</h2>
        {vendor.packages.length === 0 ? (
          <EmptyState icon={Package} title="No packages listed yet" description="This vendor hasn't published any packages." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vendor.packages.map((pkg) => (
              <Card key={pkg.id} hoverLift className="overflow-hidden">
                {pkg.photos && pkg.photos.length > 0 && (
                  <div className="mb-3 -m-4 mb-4 flex gap-1 overflow-x-auto">
                    {pkg.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`${pkg.title} photo ${idx + 1}`}
                        className="h-36 w-full shrink-0 object-cover"
                      />
                    ))}
                  </div>
                )}
                <h3 className="font-bold text-neutral-900">{pkg.title}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-500">{pkg.category}</p>
                {pkg.description && <p className="mt-2 text-sm text-neutral-500">{pkg.description}</p>}
                <p className="mt-3 text-lg font-extrabold text-neutral-900">₹{pkg.price.toLocaleString()}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">Availability</h2>
        <Card>
          <BlockedDatesList dates={unavailableDates ?? []} emptyLabel="No unavailable dates — this vendor is open on all upcoming dates" />
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">Reviews</h2>
          <Button variant="outline" size="sm" onClick={handleWriteReview}>
            Write a review
          </Button>
        </div>
        {vendor.reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet — be the first to book and review!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {vendor.reviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-800">{review.reviewer_name}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-accent-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="shrink-0 rounded-full p-1 text-neutral-300 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete review"
                        title="Delete review"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">Profile</h2>
        <Card>
          {vendor.profile_urls && vendor.profile_urls.length > 0 ? (
            <div className="flex flex-col gap-2">
              {vendor.profile_urls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex max-w-full items-center gap-2 text-sm text-brand-500 hover:underline"
                >
                  <LinkIcon size={14} className="shrink-0" />
                  <span className="truncate">{url}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">Not updated</p>
          )}
        </Card>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleBookClick}>Request booking</Button>
      </div>

      {vendor && <RequestBookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} vendor={vendor} />}
      <AddReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} vendorId={id} />
      <PrimeMembershipModal isOpen={showPrimeModal} onClose={() => setShowPrimeModal(false)} />
    </div>
  );
}
