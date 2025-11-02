import { MessageSquare, Upload, CreditCard, Moon, Sun, Brain, FileText, Network, Mic, BookOpen, Bot, User, Settings, Info, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { title: "Upload PDF", url: "/", icon: Upload },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Podcast", url: "/podcast", icon: Mic },
  { title: "Flashcards", url: "/flashcards", icon: CreditCard },
  { title: "Quiz", url: "/quiz", icon: Brain },
  { title: "Question Paper", url: "/question-paper", icon: FileText },
  { title: "Mindmap", url: "/mindmap", icon: Network },
  { title: "Summary", url: "/summary", icon: BookOpen },
];

export const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const { open } = useSidebar();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error logging out");
      } else {
        toast.success("Logged out successfully");
        navigate("/auth");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        {!open && (
          <SidebarHeader className="border-b border-sidebar-border p-2">
            <SidebarTrigger className="mx-auto" />
          </SidebarHeader>
        )}
        {open && (
          <SidebarHeader className="border-b border-sidebar-border p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden bg-gradient-to-br from-primary to-accent">
                  {/* Place your logo at public/logo.png. The image will replace the Bot icon. */}
                  <img
                    src="/logo.png"
                    alt="EduSeva logo"
                    className="h-10 w-10 object-cover"
                    onError={(e: any) => { e.currentTarget.src = '/logo.svg'; }}
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-sidebar-foreground">EduSeva</h1>
                  <p className="text-xs text-sidebar-foreground/70">AI Study Assistant</p>
                </div>
              </div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
        )}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-base">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`w-full bg-sidebar-accent hover:bg-sidebar-accent/80 ${open ? 'justify-start gap-2' : 'justify-center px-0'}`}
            >
              <User className="h-4 w-4 text-sidebar-accent-foreground" />
              {open && <span className="text-sidebar-accent-foreground">Account</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/account" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Account Details
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/about" className="cursor-pointer">
                <Info className="mr-2 h-4 w-4" />
                About Us
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
              <div className="relative w-4 h-4 flex items-center justify-center mr-2">
                <Sun className="absolute h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              {theme === "dark" ? "Light" : "Dark"} Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      </Sidebar>
      {!open && (
        <div className="fixed left-16 top-2 z-50 flex items-center gap-2">
          <h1 className="text-lg font-bold text-foreground">EduSeva</h1>
        </div>
      )}
    </>
  );
};
