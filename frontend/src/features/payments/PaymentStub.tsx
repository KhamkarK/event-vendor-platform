import { motion } from "framer-motion";
import { CreditCard, Landmark, Smartphone, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

const methods = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
];

/**
 * UI-only placeholder for the payment gateway. Per the current project scope,
 * real gateway integration (Razorpay/Stripe, escrow, refunds) is a planned
 * future enhancement — this screen exists so the booking flow feels complete
 * without wiring up a live payment processor yet.
 */
export function PaymentStub() {
  const [selected, setSelected] = useState("upi");

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-2xl font-extrabold text-neutral-900">Payments</h1>
        <span className="flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-[11px] font-bold uppercase text-accent-600">
          <Sparkles size={12} /> Coming soon
        </span>
      </div>

      <Card>
        <p className="mb-5 text-sm text-neutral-500">
          Live payments aren&apos;t wired up yet — this preview shows how advance payments and gateway checkout will look once
          integration ships.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {methods.map((method) => {
            const Icon = method.icon;
            const active = selected === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setSelected(method.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  active ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <Icon size={20} className={active ? "text-brand-600" : "text-neutral-400"} />
                <span className={`text-xs font-semibold ${active ? "text-brand-700" : "text-neutral-600"}`}>{method.label}</span>
              </button>
            );
          })}
        </div>

        <motion.div layout className="mt-6 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
          {selected === "upi" && "You'll be redirected to your UPI app to complete the advance payment."}
          {selected === "card" && "Secure card checkout — powered by a gateway integration, coming soon."}
          {selected === "netbanking" && "Choose your bank to pay directly via net banking."}
        </motion.div>

        <Button fullWidth className="mt-6" disabled>
          Pay advance amount (disabled — preview only)
        </Button>
      </Card>
    </div>
  );
}
