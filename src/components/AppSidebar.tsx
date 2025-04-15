import { Book, CalendarDays, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AppSidebarProps {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

export function AppSidebar({
  isOpen: propsIsOpen,
  toggleSidebar: propsToggleSidebar,
}: AppSidebarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const ndërroSidebarin = () => {
    setIsOpen(!isOpen);
  };

  const sidebarHapur = propsIsOpen !== undefined ? propsIsOpen : isOpen;
  const toggleSidebar = propsToggleSidebar || ndërroSidebarin;

  // Mbylle sidebarin kur ndryshon faqja në pajisjet mobile
  useEffect(() => {
    if (isMobile && sidebarHapur) {
      toggleSidebar();
    }
  }, [location.pathname, isMobile]);

  const ështëAktive = (path: string) => location.pathname === path;

  // Artikujt për navigim
  const artikujt = [
    {
      title: "Ligjëratat dhe ushtrimet",
      path: "/",
      icon: Book,
    },
    {
      title: "Provimet",
      path: "/exams",
      icon: CalendarDays,
    },
  ];

  const shkoTe = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Sidebar për mobile (me Sheet)
  if (isMobile) {
    return (
      <Sheet open={sidebarHapur} onOpenChange={toggleSidebar}>
        <SheetContent side="left" className="w-[250px] p-0 bg-gray-800 text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-xl">Orari i Universitetit</h2>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {artikujt.map((item) => (
                  <li key={item.title}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        ështëAktive(item.path)
                          ? "bg-gray-700"
                          : "hover:bg-gray-700"
                      }`}
                      onClick={() => shkoTe(item.path)}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.title}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Sidebar për desktop
  return (
    <div
      className={`${
        sidebarHapur ? "w-64" : "w-0 lg:w-20"
      } bg-gray-800 text-white transition-all duration-300 h-full overflow-hidden flex-shrink-0`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-5">
          <h2 className={`font-bold text-xl ${!sidebarHapur && "hidden"}`}>
            Orari i Universitetit
          </h2>
        </div>

        <nav className="mt-8 px-4 flex-1">
          <ul className="space-y-2">
            {artikujt.map((item) => (
              <li key={item.title}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    ështëAktive(item.path)
                      ? "bg-gray-700"
                      : "hover:bg-gray-700"
                  } ${!sidebarHapur && "lg:justify-center"}`}
                  onClick={() => shkoTe(item.path)}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  <span className={`${!sidebarHapur ? "hidden" : ""}`}>
                    {item.title}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default AppSidebar;
