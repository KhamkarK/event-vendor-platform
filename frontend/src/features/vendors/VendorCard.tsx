import { motion } from "framer-motion";
import { Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { VerifiedRibbon } from "@/components/common/VerifiedRibbon";
import { toggleWishlist } from "@/features/vendors/vendorsApi";
import type { VendorSearchResult } from "@/types/vendor";
import { useAuthStore } from "@/store/authStore";

export function VendorCard({ vendor }: { vendor: VendorSearchResult }) {
  const { isAuthenticated } = useAuthStore();
  const [wishlisted, setWishlisted] = useState(false);
  const cheapestPackage = vendor.packages?.length ? Math.min(...vendor.packages.map((p) => p.price)) : null;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Log in to save vendors to your wishlist");
      return;
    }
    const result = await toggleWishlist(vendor.id);
    setWishlisted(result.wishlisted);
    toast.success(result.wishlisted ? "Added to wishlist" : "Removed from wishlist");
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link to={`/vendors/${vendor.id}`} className="block h-full">
        <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-card">
          <div className="relative flex h-32 items-center justify-center bg-brand-gradient-soft">
            <span className="text-3xl font-black text-brand-300">{vendor.business_name.charAt(0)}</span>
            {vendor.is_featured && (
              <span className="absolute left-3 top-3 rounded-full bg-accent-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                Featured
              </span>
            )}
            <button
              onClick={handleWishlist}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow transition-colors hover:text-red-500"
              aria-label="Toggle wishlist"
            >
              <Heart size={15} fill={wishlisted ? "currentColor" : "none"} className={wishlisted ? "text-red-500" : ""} />
            </button>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-neutral-900">{vendor.business_name}</h3>
            </div>
            {vendor.is_approved && <VerifiedRibbon compact className="mt-1.5 w-fit" />}
            <p className="text-xs font-medium text-brand-500">{vendor.category}</p>

            <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Star size={13} className="fill-accent-400 text-accent-400" /> {vendor.rating_avg.toFixed(1)} ({vendor.rating_count})
              </span>
              {vendor.location && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={13} /> {vendor.location}
                </span>
              )}
            </div>

            <div className="mt-auto pt-3 text-sm">
              {cheapestPackage !== null ? (
                <p className="font-semibold text-neutral-800">
                  Starting at <span className="text-brand-600">₹{cheapestPackage.toLocaleString()}</span>
                </p>
              ) : (
                <p className="text-neutral-400">Packages coming soon</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
