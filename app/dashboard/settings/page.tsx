import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserById } from "@/lib/db/queries"
import { formatDateReadable } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const profile = await getUserById(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
          {profile?.phone && (
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Member Since</p>
            <p className="text-sm text-muted-foreground">
              {profile?.created_at ? formatDateReadable(profile.created_at) : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

