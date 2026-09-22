import { Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { SignupPage } from "@/features/auth/SignupPage";
import { AdminDashboardPage } from "@/features/admin/AdminDashboardPage";
import { CommissionSettings } from "@/features/admin/CommissionSettings";
import { ReportsPage } from "@/features/admin/ReportsPage";
import { VendorApprovalPage } from "@/features/admin/VendorApprovalPage";
import { BudgetAllocator } from "@/features/budget/BudgetAllocator";
import { CreateEventPage } from "@/features/events/CreateEventPage";
import { EventBookingsPage } from "@/features/events/EventBookingsPage";
import { EventList } from "@/features/events/EventList";
import { EventTypesPage } from "@/features/events/EventTypesPage";
import { PaymentStub } from "@/features/payments/PaymentStub";
import { BookingCalendar } from "@/features/vendorDashboard/BookingCalendar";
import { LedgerPage } from "@/features/vendorDashboard/LedgerPage";
import { PackageManager } from "@/features/vendorDashboard/PackageManager";
import { QuotationManager } from "@/features/vendorDashboard/QuotationManager";
import { VendorDashboardPage } from "@/features/vendorDashboard/VendorDashboardPage";
import { VendorDetailPage } from "@/features/vendors/VendorDetailPage";
import { VendorSearchPage } from "@/features/vendors/VendorSearchPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

// NOTE: Deliberately a plain <Routes> tree with no top-level AnimatePresence/location-key
// wrapper. That pattern previously crossfaded between completely different tree shapes
// (the full AppLayout — navbar/footer — vs the standalone auth pages), and under a
// logout-triggered redirect the exit transition could stall, leaving the old navbar
// visible over blank content until a hard refresh. Per-page enter animation still comes
// from PageTransition inside AppLayout; only the animated *exit* between layouts was
// dropped, in exchange for routing that can't get stuck.
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/event-types" element={<EventTypesPage />} />
        <Route path="/vendors" element={<VendorSearchPage />} />
        <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />

        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <EventList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/budget"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <BudgetAllocator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/bookings"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <EventBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <PaymentStub />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <VendorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-dashboard/calendar"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <BookingCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-dashboard/packages"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <PackageManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-dashboard/quotations"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <QuotationManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-dashboard/ledger"
          element={
            <ProtectedRoute allowedRoles={["vendor"]}>
              <LedgerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <VendorApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/commissions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CommissionSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
