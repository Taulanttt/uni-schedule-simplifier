// AdminDashboard.tsx
import React, { useState } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import NotificationForm from "./NotificationForm";
import ScheduleManagementForm from "./ScheduleManagementForm";
import ExamsScheduleForm from "./ExamsScheduleForm";
import AdminCrudPage from "./AdminCrudPage";
import SchedulesAdminPage from "./SchedulesAdminPage";
import ExamsAdminPage from "./ExamsAdminPage"; // <== newly added

type AdminPage =
  | "notifications"
  | "schedule"
  | "exams"
  | "crud"
  | "schedulesAdmin"
  | "examsAdmin";

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AdminPage>("notifications");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "notifications":
        return "Send Student Notification";
      case "schedule":
        return "Schedule Management";
      case "exams":
        return "Exams Schedule";
      case "crud":
        return "CRUD Management";
      case "schedulesAdmin":
        return "Schedules Admin";
      case "examsAdmin":
        return "Exams Admin";
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 mr-4 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {currentPage === "notifications" ? (
            <NotificationForm />
          ) : currentPage === "schedule" ? (
            <ScheduleManagementForm />
          ) : currentPage === "exams" ? (
            <ExamsScheduleForm />
          ) : currentPage === "crud" ? (
            <AdminCrudPage />
          ) : currentPage === "schedulesAdmin" ? (
            <SchedulesAdminPage />
          ) : (
            <ExamsAdminPage />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
