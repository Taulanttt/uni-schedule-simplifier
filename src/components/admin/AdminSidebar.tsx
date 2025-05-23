import React from "react";
import {
  BellRing,
  Calendar,
  BookOpen,
  Database,
  ListOrdered,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosInstance";
import Logo from "/logo.png";

/* ---------- Types ---------- */
type AdminPage =
  | "notifications"
  | "schedule"
  | "exams"
  | "crud"
  | "schedulesAdmin"
  | "examsAdmin";

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: AdminPage;
  setCurrentPage: (page: AdminPage) => void;
}

/* ================================================================= */
const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  toggleSidebar,
  currentPage,
  setCurrentPage,
}) => {
  const isMobile = useIsMobile();
  const navigate  = useNavigate();
  const { toast } = useToast();

  /* ---------- Main navigation handler ---------- */
  const handleNavigation = (page: AdminPage) => {
    setCurrentPage(page);
    if (isMobile) toggleSidebar();
  };

  /* ---------- Logout handler ---------- */
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      toast({
        title: "Çkyqja u krye",
        description: "Shihemi herën tjetër!",
      });
      navigate("/login");
    }
  };

  /* ---------- MENU ITEMS (shared) ---------- */
  const renderMenuItems = () => (
    <ul className="space-y-1 text-sm">
      {/* ---------- ORARI MËSIMOR ---------- */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-3">
          Orari Mësimor
        </li>
      )}
      <li>
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            currentPage === "schedule" ? "bg-gray-700" : "hover:bg-gray-700"
          } ${!isOpen && "lg:justify-center"}`}
          onClick={() => handleNavigation("schedule")}
        >
          <Calendar className="h-5 w-5 mr-2" />
          {isOpen && <span>Shto</span>}
        </Button>
      </li>
      <li>
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            currentPage === "schedulesAdmin" ? "bg-gray-700" : "hover:bg-gray-700"
          } ${!isOpen && "lg:justify-center"}`}
          onClick={() => handleNavigation("schedulesAdmin")}
        >
          <ListOrdered className="h-5 w-5 mr-2" />
          {isOpen && <span>Menaxho</span>}
        </Button>
      </li>

      {/* ---------- ORARI I PROVIMEVE ---------- */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-4">
          Orari i Provimeve
        </li>
      )}
      <li>
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            currentPage === "exams" ? "bg-gray-700" : "hover:bg-gray-700"
          } ${!isOpen && "lg:justify-center"}`}
          onClick={() => handleNavigation("exams")}
        >
          <BookOpen className="h-5 w-5 mr-2" />
          {isOpen && <span>Shto</span>}
        </Button>
      </li>
      <li>
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            currentPage === "examsAdmin" ? "bg-gray-700" : "hover:bg-gray-700"
          } ${!isOpen && "lg:justify-center"}`}
          onClick={() => handleNavigation("examsAdmin")}
        >
          <ClipboardList className="h-5 w-5 mr-2" />
          {isOpen && <span>Menaxho</span>}
        </Button>
      </li>

      {/* ---------- NJOFTIMET ---------- */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-4">
          Njoftimet
        </li>
      )}
      <li>
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            currentPage === "notifications" ? "bg-gray-700" : "hover:bg-gray-700"
          } ${!isOpen && "lg:justify-center"}`}
          onClick={() => handleNavigation("notifications")}
        >
          <BellRing className="h-5 w-5 mr-2" />
          {isOpen && <span>Email</span>}
        </Button>
      </li>

      {/* ---------- KONFIGURIMET ---------- */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-4">
          Konfigurimet
        </li>
      )}
      <li>
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            currentPage === "crud" ? "bg-gray-700" : "hover:bg-gray-700"
          } ${!isOpen && "lg:justify-center"}`}
          onClick={() => handleNavigation("crud")}
        >
          <Database className="h-5 w-5 mr-2" />
          {isOpen && <span>Menaxho</span>}
        </Button>
      </li>

      {/* ---------- LOGOUT ---------- */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-4">
          Llogaria
        </li>
      )}
      <li>
        <Button
          variant="ghost"
          className={`w-full justify-start hover:bg-gray-700 ${
            !isOpen && "lg:justify-center"
          }`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {isOpen && <span>Çkyçu</span>}
        </Button>
      </li>
    </ul>
  );

  /* ---------- MOBILE ---------- */
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetContent
          side="left"
          className="w-[240px] p-0 bg-gray-800 text-white"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-700">
              <img
                src={Logo}
                alt="UniSchedule"
                className="h-6 w-6 rounded-full object-cover"
              />
              <h2 className="font-bold text-lg">UniSchedule Admin</h2>
            </div>
            {/* Menu */}
            <nav className="mt-4 px-3 flex-1">{renderMenuItems()}</nav>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  /* ---------- DESKTOP ---------- */
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0 lg:w-20"
      } bg-gray-800 text-white transition-all duration-300 h-full overflow-hidden flex-shrink-0`}
    >
      <div className="h-full flex flex-col">
        {/* Header with logo */}
        <div className="flex items-center gap-2 p-4">
          <img
            src={Logo}
            alt="UniSchedule"
            className="h-6 w-6 rounded-full object-cover"
          />
          <h2 className={`font-bold text-xl ${!isOpen && "hidden"}`}>
            UniSchedule Admin
          </h2>
        </div>

        <nav className="mt-4 px-3 flex-1">{renderMenuItems()}</nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
