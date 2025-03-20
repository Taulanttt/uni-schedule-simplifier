import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import Index from "./pages/Index";
import Exams from "./pages/Exams";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AppSidebar from "./components/AppSidebar";

const queryClient = new QueryClient();

// Function to determine page title
function getPageTitle(pathname: string) {
  switch (pathname) {
    case "/":
      return "Lectures Schedule";
    case "/exams":
      return "Exams Schedule";
    default:
      return "Schedule";
  }
}

function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const headingText = getPageTitle(location.pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Routes>
      {/* Admin route (doesn't use the sidebar layout) */}
      <Route path="/admin" element={<Admin />} />

      {/* Main Layout */}
      <Route
        path="*"
        element={
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

                  {/* Centered Heading */}
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
        }
      />
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
