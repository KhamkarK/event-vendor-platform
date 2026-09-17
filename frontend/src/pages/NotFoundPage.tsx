import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/common/Button";

export function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <p className="text-7xl font-black text-brand-200">404</p>
      <h1 className="mt-2 text-xl font-bold text-neutral-800">Page not found</h1>
      <p className="mt-1 text-sm text-neutral-500">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className="mt-6">
        <Button>
          <Home size={16} /> Back to home
        </Button>
      </Link>
    </motion.div>
  );
}
