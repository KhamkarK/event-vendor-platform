import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "@/lib/queryClient";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            className: "text-sm font-medium",
            style: { borderRadius: "12px" },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
