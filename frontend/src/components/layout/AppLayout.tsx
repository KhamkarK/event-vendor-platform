import { Outlet } from "react-router-dom";

import { BrochureModal } from "@/components/common/BrochureModal";
import { CommandPalette } from "@/components/common/CommandPalette";
import { PageTransition } from "@/components/common/PageTransition";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Navbar } from "@/components/layout/Navbar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-20 sm:px-6 lg:px-8 lg:pb-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <BrochureModal />
      <CommandPalette />
      <MobileTabBar />
    </div>
  );
}
