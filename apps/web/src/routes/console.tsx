import { createFileRoute, Outlet, Link, redirect } from '@tanstack/react-router'
import * as React from "react"
import { useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard, Users, Car, MapPin, CreditCard, Settings, HeadphonesIcon, ChevronLeft, ChevronRight, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth/auth-context"
import { authToken } from "@/lib/api/authToken"

export const Route = createFileRoute('/console')({
  beforeLoad: () => {
    const token = authToken("access")
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: ConsoleLayout,
})

const navItems = [
  { title: "Dashboard", href: "/console", icon: LayoutDashboard },
  { title: "Drivers", href: "/console/drivers", icon: Users },
  { title: "Riders", href: "/console/riders", icon: Users },
  { title: "Rides", href: "/console/rides", icon: Car },
  { title: "Vehicles", href: "/console/vehicles", icon: MapPin },
  { title: "Payments", href: "/console/payments", icon: CreditCard },
  { title: "Settings", href: "/console/settings", icon: Settings },
  { title: "Support", href: "/console/support", icon: HeadphonesIcon },
]

function SidebarNav() {
  const { location } = useRouterState()
  const pathname = location.pathname

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== "/console" && pathname.startsWith(item.href + "/"))
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

function ConsoleLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className={cn("hidden border-r bg-background lg:block transition-all duration-300", sidebarCollapsed ? "w-16" : "w-64")}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b px-4">
            {!sidebarCollapsed ? (
              <Link to="/console" className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">F</div>
                <span>FLIT Admin</span>
              </Link>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">F</div>
            )}
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <SidebarNav />
          </ScrollArea>
          <div className="border-t p-3 space-y-2">
            {!sidebarCollapsed && user && (
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className={cn("w-full", sidebarCollapsed ? "justify-center" : "justify-start")} title="Logout">
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Logout</span>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full justify-center">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-2" />Collapse</>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">F</div>
            <span>FLIT Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
