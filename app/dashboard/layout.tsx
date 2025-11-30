import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/login?redirect=/dashboard")
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

