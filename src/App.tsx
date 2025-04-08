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

const queryClient = new QueryClient();

// A small function to get the heading for the main layout
function getPageTitle(pathname: string) {
  switch (pathname) {
    case "/":
      return "Orari i Ligjeratave dhe Ushtrimeve";
    case "/exams":
      return "Orari i Provimeve";
    default:
      return "Schedule";
  }
}

// A PrivateRoute to protect /admin
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  // If no token => redirect to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// The main layout with side nav for /, /exams, etc.
function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const headingText = getPageTitle(location.pathname);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 lg:p-6 flex-1 overflow-auto">
          {/* Top row: Sidebar toggle button & centered heading */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={toggleSidebar}
              className="p-2 bg-gray-800 text-white rounded-md"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-center">{headingText}</h1>
            </div>
          </div>

          {/* Content Routes */}
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

// The main router
function MainApp() {
  return (
    <Routes>
      {/* Public route for login */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected /admin route */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* The main layout for /, /exams, etc. */}
      <Route path="*" element={<MainLayout />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
