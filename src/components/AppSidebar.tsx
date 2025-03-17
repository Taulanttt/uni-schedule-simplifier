
import { Book, CalendarDays, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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

  return (
    <div
      className={`${
        effectiveIsOpen ? 'w-64' : 'w-0 lg:w-20'
      } bg-gray-800 text-white transition-all duration-300 relative h-screen`}
    >
      <div className="sticky top-0 left-0 right-0">
        <div className="flex items-center justify-between p-5">
          <h2 className={`font-bold text-xl ${!effectiveIsOpen && 'lg:hidden'}`}>UniSchedule</h2>
          <button
            onClick={effectiveToggleSidebar}
            className="absolute -right-3 top-5 bg-gray-800 text-white p-1 rounded-full hidden lg:block"
          >
            {effectiveIsOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="mt-8 px-4">
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
                  <span className={`${!effectiveIsOpen && 'lg:hidden'}`}>{item.title}</span>
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
