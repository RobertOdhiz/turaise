"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Plus, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "My Campaigns", icon: LayoutDashboard },
  { href: "/dashboard/create", label: "Create Campaign", icon: Plus },
  { href: "/dashboard/withdraw", label: "Request Withdrawal", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4 flex flex-col">
      <Link href="/" className="text-2xl font-bold text-primary mb-8">
        TuFund
      </Link>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="space-y-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  )
}

