import React from "react";
import {
  BellRing,
  Calendar,
  BookOpen,
  Database,
  ListOrdered,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  toggleSidebar,
  currentPage,
  setCurrentPage,
}) => {
  const isMobile = useIsMobile();

  const handleNavigation = (page: AdminPage) => {
    setCurrentPage(page);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const renderMenuItems = () => (
    <ul className="space-y-2 text-sm">
      {/* ORARI MËSIMOR */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-4">
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
  
      {/* ORARI I PROVIMEVE */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-6">
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
  
      {/* NJOFTIMET */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-6">
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
  
      {/* KONFIGURIMET */}
      {isOpen && (
        <li className="text-gray-400 uppercase font-bold px-2 mt-6">
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
    </ul>
  );
  

  // MOBILE SIDEBAR
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetContent side="left" className="w-[250px] p-0 bg-gray-800 text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-xl">Paneli i Adminit</h2>
            </div>
            <nav className="mt-8 px-4 flex-1">{renderMenuItems()}</nav>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // DESKTOP SIDEBAR
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0 lg:w-20"
      } bg-gray-800 text-white transition-all duration-300 h-full overflow-hidden flex-shrink-0`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-5">
          <h2 className={`font-bold text-xl ${!isOpen && "hidden"}`}>Admin</h2>
        </div>
        <nav className="mt-8 px-4 flex-1">{renderMenuItems()}</nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
