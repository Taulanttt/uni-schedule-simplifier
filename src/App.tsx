
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Exams from "./pages/Exams";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AppSidebar from "./components/AppSidebar";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route
              path="*"
              element={
                <div className="flex min-h-screen w-full overflow-hidden">
                  <AppSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <div className="flex-1 overflow-auto">
                    <div className="p-4 lg:p-6">
                      <div className="lg:hidden mb-4">
                        <button
                          onClick={toggleSidebar}
                          className="p-2 bg-gray-800 text-white rounded-md"
                        >
                          <Menu className="h-5 w-5" />
                        </button>
                      </div>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/exams" element={<Exams />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
