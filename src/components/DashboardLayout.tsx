import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, 
  LayoutDashboard, 
  Map, 
  Bell, 
  FileText, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationCenter } from '@/components/NotificationCenter';
import { GlobalSearch } from '@/components/GlobalSearch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Map View', icon: Map },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileText },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - Sticky */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-gradient-sidebar border-r border-border/40 z-50 transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-border/40">
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-gradient-to-br from-primary to-primary/60 glow-primary">
              <Wind className="w-5 h-5 text-primary-foreground" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-display font-bold text-base text-foreground whitespace-nowrap">
                    VayuWatch
                  </h1>
                  <p className="text-[10px] text-muted-foreground -mt-0.5 whitespace-nowrap">
                    Air Quality Monitor
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Live Status Indicator */}
        <div className={cn(
          "mx-3 mt-4 mb-2 p-2 rounded-md bg-success/10 border border-success/20",
          sidebarCollapsed ? "flex justify-center" : ""
        )}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-success" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-success animate-ping opacity-75" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xs text-success font-medium">Live Data</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            const NavButton = (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "nav-item",
                  isActive && "nav-item-active",
                  sidebarCollapsed && "justify-center px-0"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {NavButton}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return NavButton;
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border/40 p-3 space-y-2">
          {isAuthenticated ? (
            <>
              <div className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md bg-secondary/30",
                sidebarCollapsed && "justify-center px-0"
              )}>
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user?.phone}
                    </p>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={logout}
                className={cn(
                  "w-full text-muted-foreground hover:text-foreground",
                  sidebarCollapsed && "px-0"
                )}
              >
                <LogOut className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Logout</span>}
              </Button>
            </>
          ) : (
            <Link to="/login" className="block">
              <Button
                size="sm"
                variant="secondary"
                className={cn("w-full", sidebarCollapsed && "px-0")}
              >
                <User className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Login</span>}
              </Button>
            </Link>
          )}

          {/* Collapse Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn("w-full text-muted-foreground", sidebarCollapsed && "px-0")}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-56"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-14 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <GlobalSearch />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Beta Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20">
                <Activity className="w-3 h-3 text-accent" />
                <span className="text-xs font-medium text-accent">Beta v1.0</span>
              </div>

              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}