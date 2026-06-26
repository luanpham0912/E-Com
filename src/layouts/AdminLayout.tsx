import { useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  ChevronLeft,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Customers", href: "/admin/customers" },
  { icon: Tag, label: "Categories", href: "/admin/categories" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout() {
  const { theme, setTheme, sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-dvh bg-background">
        <motion.aside
          animate={{ width: sidebarCollapsed ? 72 : 256 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col border-r bg-card max-h-dvh"
        >
          <div className="flex items-center h-16 px-4 border-b gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">
                S
              </span>
            </div>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-sm tracking-tight"
              >
                Admin Panel
              </motion.span>
            )}
          </div>

          <nav className="flex-1 py-4 px-2 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/admin" &&
                  location.pathname.startsWith(item.href));

              const NavLink = (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );

              return sidebarCollapsed ? (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                NavLink
              );
            })}
          </nav>

          <div className="p-2 space-y-1 border-t">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-3",
                sidebarCollapsed && "justify-center px-0",
              )}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              ) : (
                <Moon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              )}
              {!sidebarCollapsed && (
                <span className="text-sm">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start gap-3 text-destructive hover:text-destructive",
                sidebarCollapsed && "justify-center px-0",
              )}
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {!sidebarCollapsed && <span className="text-sm">Logout</span>}
            </Button>
          </div>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={toggleSidebar}
            >
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </motion.div>
            </Button>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col min-w-0 max-h-dvh">
          <header className="h-16 border-b bg-card flex items-center justify-between px-6">
            <div>
              <h2 className="font-semibold">
                {NAV_ITEMS.find(
                  (i) =>
                    location.pathname === i.href ||
                    (i.href !== "/admin" &&
                      location.pathname.startsWith(i.href)),
                )?.label ?? "Dashboard"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Welcome back, {user?.name ?? "Admin"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.[0] ?? "A"}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 overflow-y-scroll p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
