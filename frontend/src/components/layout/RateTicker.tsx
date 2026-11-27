import { useQuery } from "@tanstack/react-query";

import { getMetalRate } from "@/features/metalRates/metalRatesApi";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** Site-wide running strip just below the Navbar (see AppLayout) showing the
 * Gold/Silver rates an admin set via Admin > Metal Rates
 * (features/admin/MetalRatesSettings.tsx). Renders nothing until an admin has
 * set a rate for the first time -- same "nothing to show yet" behavior as
 * AdBanner/AdSlot. The scrolling text is duplicated once so the CSS marquee
 * (see index.css's .animate-marquee) can loop seamlessly at -50%. */
export function RateTicker() {
  const { data: rate, isLoading } = useQuery({
    queryKey: ["metal-rate"],
    queryFn: getMetalRate,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading || !rate || (rate.gold_rate_per_10g == null && rate.silver_rate_per_kg == null)) return null;

  const parts: string[] = [];
  if (rate.gold_rate_per_10g != null) parts.push(`Gold (10g): ${INR.format(rate.gold_rate_per_10g)}`);
  if (rate.silver_rate_per_kg != null) parts.push(`Silver (1kg): ${INR.format(rate.silver_rate_per_kg)}`);
  const text = parts.join("   •   ");

  return (
    <div className="w-full overflow-hidden bg-neutral-900 py-1.5 text-white">
      <div className="flex w-max animate-marquee whitespace-nowrap text-sm font-medium">
        <span className="px-4">{text}</span>
        <span className="px-4">{text}</span>
      </div>
    </div>
  );
}
