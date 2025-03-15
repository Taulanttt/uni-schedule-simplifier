
import React from 'react';
import { BellRing, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: 'notifications' | 'schedule';
  setCurrentPage: (page: 'notifications' | 'schedule') => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  toggleSidebar,
  currentPage,
  setCurrentPage,
}) => {
  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-0 lg:w-20'
      } bg-gray-800 text-white transition-all duration-300 relative`}
    >
      <div className="sticky top-0 left-0 right-0">
        <div className="flex items-center justify-between p-5">
          <h2 className={`font-bold text-xl ${!isOpen && 'lg:hidden'}`}>Admin</h2>
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-5 bg-gray-800 text-white p-1 rounded-full hidden lg:block"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
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
                onClick={() => setCurrentPage('notifications')}
              >
                <BellRing className="h-5 w-5 mr-2" />
                <span className={`${!isOpen && 'lg:hidden'}`}>Notifications</span>
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
                onClick={() => setCurrentPage('schedule')}
              >
                <Calendar className="h-5 w-5 mr-2" />
                <span className={`${!isOpen && 'lg:hidden'}`}>Schedule</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
