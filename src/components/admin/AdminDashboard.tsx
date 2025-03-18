
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import NotificationForm from './NotificationForm';
import ScheduleManagementForm from './ScheduleManagementForm';
import ExamsScheduleForm from './ExamsScheduleForm';

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'notifications' | 'schedule' | 'exams'>('notifications');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow p-4">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 mr-4 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">
              {currentPage === 'notifications' 
                ? 'Send Student Notification' 
                : currentPage === 'schedule'
                ? 'Schedule Management'
                : 'Exams Schedule'}
            </h1>
          </div>
        </header>
        
        <main className="p-6">
          {currentPage === 'notifications' ? (
            <NotificationForm />
          ) : currentPage === 'schedule' ? (
            <ScheduleManagementForm />
          ) : (
            <ExamsScheduleForm />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
