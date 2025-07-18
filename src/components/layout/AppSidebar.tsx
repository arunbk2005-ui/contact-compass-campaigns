import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Megaphone, 
  Target,
  BarChart3,
  Settings,
  MapPin,
  Factory,
  UserCheck,
  TrendingUp,
  Briefcase
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone },
  { title: "Audiences", url: "/audiences", icon: Target },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
]

const managementItems = [
  { title: "Industries", url: "/industries", icon: Factory },
  { title: "Cities", url: "/cities", icon: MapPin },
  { title: "Departments", url: "/departments", icon: Briefcase },
  { title: "Job Levels", url: "/job-levels", icon: UserCheck },
  { title: "Company Turnovers", url: "/comp-turnovers", icon: TrendingUp },
  { title: "Employee Ranges", url: "/emp-ranges", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center transition-all duration-200 ${
      isActive 
        ? "bg-primary text-primary-foreground font-medium shadow-sm" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`

  return (
    <Sidebar
      className="border-r border-border"
      collapsible="icon"
    >
      <SidebarContent className="bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-foreground">CampaignPro</h2>
                <p className="text-xs text-muted-foreground">Lead Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mx-2">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
            {!isCollapsed && "Management"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="mx-2">
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}