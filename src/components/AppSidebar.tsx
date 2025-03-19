
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

export function AppSidebar({ isOpen: propsIsOpen, toggleSidebar: propsToggleSidebar }: AppSidebarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleSidebarInternal = () => {
    setIsOpen(!isOpen);
  };
  
  const effectiveIsOpen = propsIsOpen !== undefined ? propsIsOpen : isOpen;
  const effectiveToggleSidebar = propsToggleSidebar || toggleSidebarInternal;

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile && effectiveIsOpen) {
      effectiveToggleSidebar();
    }
  }, [location.pathname, isMobile]);
  
  const isActive = (path: string) => location.pathname === path;

  // Navigation items
  const items = [
    {
      title: "Lectures",
      path: "/",
      icon: Book,
    },
    {
      title: "Exams",
      path: "/exams",
      icon: CalendarDays,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // For mobile, use Sheet component
  if (isMobile) {
    return (
      <Sheet open={effectiveIsOpen} onOpenChange={effectiveToggleSidebar}>
        <SheetContent side="left" className="w-[250px] p-0 bg-gray-800 text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-xl">UniSchedule</h2>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.title}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive(item.path)
                          ? 'bg-gray-700'
                          : 'hover:bg-gray-700'
                      }`}
                      onClick={() => handleNavigation(item.path)}
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

  // For desktop
  return (
    <div
      className={`${
        effectiveIsOpen ? 'w-64' : 'w-0 lg:w-20'
      } bg-gray-800 text-white transition-all duration-300 h-full overflow-hidden flex-shrink-0`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-5">
          <h2 className={`font-bold text-xl ${!effectiveIsOpen && 'hidden'}`}>UniSchedule</h2>
        </div>

        <nav className="mt-8 px-4 flex-1">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.title}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive(item.path)
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-700'
                  } ${!effectiveIsOpen && 'lg:justify-center'}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  <span className={`${!effectiveIsOpen ? 'hidden' : ''}`}>{item.title}</span>
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
