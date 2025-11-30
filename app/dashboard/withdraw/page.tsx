"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { withdrawalRequestSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import type { z } from "zod"

type WithdrawalForm = z.infer<typeof withdrawalRequestSchema>

export default function WithdrawPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const { data: session } = useSession()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<WithdrawalForm>()

  useEffect(() => {
    async function fetchCampaigns() {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/campaigns/user")
          if (response.ok) {
            const { campaigns: userCampaigns } = await response.json()
            setCampaigns(userCampaigns.filter((c: any) => c.status === "active"))
          }
        } catch (error) {
          console.error("Error fetching campaigns:", error)
        }
      }
    }
    fetchCampaigns()
  }, [session])

  const onSubmit = async (data: WithdrawalForm) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit withdrawal request")
      }

      toast({
        title: "Request Submitted",
        description:
          "Your withdrawal request has been submitted. An admin will review it shortly.",
      })

      reset()
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Request Withdrawal</h1>
        <p className="text-muted-foreground mt-1">
          Request to withdraw funds from your campaign
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Details</CardTitle>
          <CardDescription>
            Fill in the details below to request a withdrawal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campaign</Label>
              <Select
                onValueChange={(value) => setValue("campaign_id", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.title} - {formatCurrency(Number(campaign.current_amount))} raised
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campaign_id && (
                <p className="text-sm text-destructive">
                  {errors.campaign_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="100"
                {...register("amount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account">Bank Account Details</Label>
              <Textarea
                id="bank_account"
                {...register("bank_account")}
                disabled={isLoading}
                placeholder="Account name, bank, account number, etc."
              />
              {errors.bank_account && (
                <p className="text-sm text-destructive">
                  {errors.bank_account.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Withdrawal</Label>
              <Textarea
                id="reason"
                {...register("reason")}
                disabled={isLoading}
                placeholder="Explain why you need to withdraw these funds"
              />
              {errors.reason && (
                <p className="text-sm text-destructive">{errors.reason.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

