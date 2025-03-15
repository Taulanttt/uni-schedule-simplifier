
import { Book, CalendarDays, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  
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

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">UniSchedule</span>
        </div>
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </SidebarHeader>
      
      {/* Toggle sidebar button - moved to top */}
      <div className="absolute top-4 right-0 translate-x-1/2 z-20">
        <Button 
          size="icon" 
          variant="secondary"
          className="rounded-full shadow-md"
          onClick={toggleSidebar}
          aria-label={state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {state === 'expanded' ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={isActive(item.path)} 
                    onClick={() => navigate(item.path)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
