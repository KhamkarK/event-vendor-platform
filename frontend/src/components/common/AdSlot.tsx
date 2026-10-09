import { useEffect, useState, type ReactNode } from "react";

import type { Advertisement } from "@/types/advertisement";

const ROTATE_INTERVAL_MS = 5000;

function AdvertisementSlide({ ad }: { ad: Advertisement }) {
  const media =
    ad.media_type === "video" ? (
      <video src={ad.media_url} autoPlay muted loop playsInline className="h-full w-full object-contain" />
    ) : (
      <img src={ad.media_url} alt="Advertisement" className="h-full w-full object-contain" />
    );
  return ad.link_url ? (
    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
      {media}
    </a>
  ) : (
    media
  );
}

interface AdSlotProps {
  /** The active banners for this placement (from getActiveAdvertisements). */
  ads?: Advertisement[];
  /** Shown on a loop, in order, only while `ads` is empty — e.g. the site-wide
   * top banner's wedding-clothing samples. Omit to render nothing when there's
   * no live banner for this placement, rather than a filler image. */
  fallbackImages?: string[];
  /** Sizing/position classes for the outer box — callers control the slot's
   * fixed dimensions (e.g. "h-32 w-full" or "h-96 w-full"). Every slide is
   * scaled to fit fully inside that box (object-contain, no cropping) against
   * a neutral fill, so the slot never resizes or covers other content but
   * also never hides part of a banner whose own aspect ratio differs from
   * the box's. */
  className: string;
}

/** A fixed-size box that crossfades through a list of banners every 5s. Used
 * for every ad placement (the site-wide top banner via AdBanner, and the
 * Event Types page's sidebar/bottom slots) so the rotation logic lives in one
 * place. Renders nothing if there's nothing to show. */
export function AdSlot({ ads, fallbackImages = [], className }: AdSlotProps) {
  const [index, setIndex] = useState(0);

  const slides: { key: string; node: ReactNode }[] =
    ads && ads.length > 0
      ? ads.map((ad) => ({ key: String(ad.id), node: <AdvertisementSlide ad={ad} /> }))
      : fallbackImages.map((src) => ({
          key: src,
          node: <img src={src} alt="Sample advertisement" className="h-full w-full object-contain" />,
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

  if (slides.length === 0) return null;

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
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
  );
}
