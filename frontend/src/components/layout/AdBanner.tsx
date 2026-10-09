import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { getActiveAdvertisements } from "@/features/advertisements/advertisementsApi";
import type { Advertisement } from "@/types/advertisement";

// Wedding-clothing sample banners (frontend/public/sample-ads), looped while
// no real ad is live so the slot is visible to every role.
const SAMPLE_ADS = [
  "/sample-ads/bridal-collection.png",
  "/sample-ads/groom-wear.png",
  "/sample-ads/season-sale.png",
];

const ROTATE_INTERVAL_MS = 5000;

function AdvertisementSlide({ ad }: { ad: Advertisement }) {
  const media =
    ad.media_type === "video" ? (
      <video src={ad.media_url} autoPlay muted loop playsInline className="h-full w-full object-cover" />
    ) : (
      <img src={ad.media_url} alt="Advertisement" className="h-full w-full object-cover" />
    );
  return ad.link_url ? (
    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
      {media}
    </a>
  ) : (
    media
  );
}

/** Site-wide running banner slot, rendered just below the Navbar on every page
 * (see AppLayout). Auto-rotates through every active ad the admin uploaded via
 * the "Advertisements" admin page (features/admin/AdvertisementsPage.tsx), in
 * the sequence set there; until any are live it loops through sample banners.
 *
 * The outer box has a fixed height (h-32) with overflow-hidden + object-cover,
 * so every slide — whatever its uploaded image/video dimensions — is cropped
 * into the same slot. That keeps the banner's size constant across rotation
 * and across however many banners the admin adds, so it never resizes, pushes
 * down, or covers the rest of the page. */
export function AdBanner() {
  const { data: ads, isLoading } = useQuery({ queryKey: ["active-advertisements"], queryFn: getActiveAdvertisements });
  const [index, setIndex] = useState(0);

  const slides: { key: string; node: ReactNode }[] =
    ads && ads.length > 0
      ? ads.map((ad) => ({ key: String(ad.id), node: <AdvertisementSlide ad={ad} /> }))
      : SAMPLE_ADS.map((src) => ({
          key: src,
          node: <img src={src} alt="Sample advertisement" className="h-full w-full object-cover" />,
        }));

  // Reset to the first slide whenever the slide count changes (e.g. the real
  // ads finish loading, or an admin adds/removes a banner elsewhere).
  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading) return null;

  return (
    <div className="w-full bg-neutral-100">
      <div className="relative mx-auto h-32 w-full max-w-7xl overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            {slide.node}
          </div>
        ))}
      </div>
    </div>
  );
}
