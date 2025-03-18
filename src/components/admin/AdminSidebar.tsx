
import React from 'react';
import { BellRing, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: 'notifications' | 'schedule' | 'exams';
  setCurrentPage: (page: 'notifications' | 'schedule' | 'exams') => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  toggleSidebar,
  currentPage,
  setCurrentPage,
}) => {
  const isMobile = useIsMobile();

  const handleNavigation = (page: 'notifications' | 'schedule' | 'exams') => {
    setCurrentPage(page);
    if (isMobile) {
      toggleSidebar();
    }
  };

  // For mobile, use Sheet component
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetContent side="left" className="w-[250px] p-0 bg-gray-800 text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="font-bold text-xl">Admin Dashboard</h2>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      currentPage === 'notifications'
                        ? 'bg-gray-700'
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleNavigation('notifications')}
                  >
                    <BellRing className="h-5 w-5 mr-2" />
                    <span>Notifications</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      currentPage === 'schedule'
                        ? 'bg-gray-700'
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleNavigation('schedule')}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Schedule</span>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      currentPage === 'exams'
                        ? 'bg-gray-700'
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => handleNavigation('exams')}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    <span>Exams</span>
                  </Button>
                </li>
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
        isOpen ? 'w-64' : 'w-0 lg:w-20'
      } bg-gray-800 text-white transition-all duration-300 relative h-screen overflow-hidden`}
    >
      <div className="sticky top-0 left-0 right-0">
        <div className="flex items-center justify-between p-5">
          <h2 className={`font-bold text-xl ${!isOpen && 'lg:hidden'}`}>Admin</h2>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  currentPage === 'notifications'
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
                } ${!isOpen && 'lg:justify-center'}`}
                onClick={() => handleNavigation('notifications')}
              >
                <BellRing className="h-5 w-5 mr-2" />
                <span className={`${!isOpen ? 'hidden' : ''}`}>Notifications</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  currentPage === 'schedule'
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
                } ${!isOpen && 'lg:justify-center'}`}
                onClick={() => handleNavigation('schedule')}
              >
                <Calendar className="h-5 w-5 mr-2" />
                <span className={`${!isOpen ? 'hidden' : ''}`}>Schedule</span>
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  currentPage === 'exams'
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700'
                } ${!isOpen && 'lg:justify-center'}`}
                onClick={() => handleNavigation('exams')}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                <span className={`${!isOpen ? 'hidden' : ''}`}>Exams</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
