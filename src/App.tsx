// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import Index from "./pages/Index";
import Exams from "./pages/Exams";
import AdminLogin from "@/components/admin/AdminLogin";
import NotFound from "./pages/NotFound";
import AppSidebar from "./components/AppSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";

// Krijimi i klientit për react-query
const queryClient = new QueryClient();

// Funksion për të marrë titullin sipas faqes
function merrTitullinFaqes(pathname: string) {
  switch (pathname) {
    case "/":
      return "Orari i Ligjëratave dhe Ushtrimeve";
    case "/exams":
      return "Orari i Provimeve";
    default:
      return "Orari";
  }
}

// Rrugë private që kërkon autentikim
function RrugëPrivate({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Layout-i kryesor për faqet publike
function PamjeKryesore() {
  const [hapSidebarin, vendosHapjenSidebarit] = useState(false);
  const vendndodhja = useLocation();
  const titulliFaqes = merrTitullinFaqes(vendndodhja.pathname);

  const ndërroSidebarin = () => vendosHapjenSidebarit(!hapSidebarin);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar isOpen={hapSidebarin} toggleSidebar={ndërroSidebarin} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 lg:p-6 flex-1 overflow-auto">
          {/* Rreshti sipër: butoni i menytë + titulli në qendër */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={ndërroSidebarin}
              className="p-2 bg-gray-800 text-white rounded-md"
              aria-label="Ndërro menynë"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-center">{titulliFaqes}</h1>
            </div>
          </div>

          {/* Rrugët e përmbajtjes */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// Rrugëzimi kryesor i aplikacionit
function AplikacioniKryesor() {
  return (
    <Routes>
      {/* Rrugë publike për hyrje në panel */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Rrugë e mbrojtur për /admin */}
      <Route
        path="/admin"
        element={
          <RrugëPrivate>
            <AdminDashboard />
          </RrugëPrivate>
        }
      />

      {/* Layout-i kryesor për përdoruesit */}
      <Route path="*" element={<PamjeKryesore />} />
    </Routes>
  );
}

// Komponenti kryesor i aplikacionit
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AplikacioniKryesor />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
