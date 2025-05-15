/* App.tsx ---------------------------------------------------------- */
import { Toaster }                     from "@/components/ui/toaster";
import { Toaster as Sonner }           from "@/components/ui/sonner";
import { TooltipProvider }             from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState }             from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Menu }                        from "lucide-react";

import Index           from "./pages/Index";
import Exams           from "./pages/Exams";
import AdminLogin      from "@/components/admin/AdminLogin";
import NotFound        from "./pages/NotFound";
import AppSidebar      from "./components/AppSidebar";
import AdminDashboard  from "@/components/admin/AdminDashboard";

/* preview pages */
import DraftList            from "./pages/preview/DraftList";
import PreviewSchedulePage  from "./pages/preview/previewToken";
import DraftIndexPage     from "./pages/preview/DraftIndex"; 
/* -------------------------------------------------- */
const queryClient = new QueryClient();

/* helpers */
function pageTitle(path: string) {
  if (path === "/")                return "Orari i Ligjëratave dhe Ushtrimeve";
  if (path.startsWith("/exams"))   return "Orari i Provimeve";
  if (path === "/preview")         return "Draft-et e Orarit";
  if (path.startsWith("/preview/"))return "Parapamja e Orarit (Draft)";
  return "Orari";
}

const Private = ({ children }: { children: React.ReactNode }) =>
  localStorage.getItem("token") ? <>{children}</> : <Navigate to="/login" />;

/* -------------------------------------------------- */
/* Public layout (sidebar + header)                   */
/* -------------------------------------------------- */
function PublicLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen((o) => !o)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 lg:p-6 flex-1 overflow-auto">
          {/* header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 bg-gray-800 text-white rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="flex-1 text-2xl font-bold text-center">
              {pageTitle(loc.pathname)}
            </h1>
          </div>

          {/* nested public routes */}
          <Routes>
            <Route path="/"        element={<Index />} />
            <Route path="/exams"   element={<Exams />} />
            {/* list of drafts lives INSIDE public layout */}
            <Route path="/preview" element={<DraftList />} />
            {/* anything else → 404 */
            }
            <Route path="*"        element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Top-level router                                   */
/* -------------------------------------------------- */
function RouterRoot() {
  return (
    <Routes>
      {/* public login */}
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/preview"               element={<DraftIndexPage />} />
      {/* single-draft preview (needs its own layout) */}
      <Route path="/preview/:previewToken" element={<PreviewSchedulePage />} />

      {/* protected admin */}
      <Route
        path="/admin"
        element={
          <Private>
            <AdminDashboard />
          </Private>
        }
      />

      {/* everything else → public layout */}
      <Route path="*" element={<PublicLayout />} />
    </Routes>
  );
}

/* -------------------------------------------------- */
/* App root                                           */
/* -------------------------------------------------- */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouterRoot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
