"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { donationSchema } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import type { z } from "zod"

type DonationForm = z.infer<typeof donationSchema>

interface DonationFormProps {
  campaignId: string
}

export function DonationForm({ campaignId }: DonationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "card">("paystack")

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      payment_method: "paystack",
    },
  })

  const onSubmit = async (data: DonationForm) => {
    setIsLoading(true)
    try {
      if (data.payment_method === "paystack") {
        if (!data.donor_email) {
          toast({
            title: "Error",
            description: "Email is required for Paystack payments",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        const response = await axios.post("/api/donate/paystack", {
          campaign_id: campaignId,
          amount: data.amount,
          donor_name: data.donor_name,
          donor_email: data.donor_email,
        })

        if (response.data.authorization_url) {
          // Redirect to Paystack payment page
          window.location.href = response.data.authorization_url
        } else {
          toast({
            title: "Error",
            description: response.data.error || "Failed to initialize payment",
            variant: "destructive",
          })
          setIsLoading(false)
        }
      } else {
        // Stripe payment
        const response = await axios.post("/api/donate/stripe", {
          campaign_id: campaignId,
          amount: data.amount,
          donor_name: data.donor_name,
          donor_email: data.donor_email,
        })

        // Redirect to Stripe Checkout
        window.location.href = response.data.url
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to process donation. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Make a Donation</CardTitle>
          <CardDescription>
            Your contribution makes a difference. Choose your payment method below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="100"
                placeholder="100"
                {...register("amount", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Minimum: KSh 100</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => {
                  setPaymentMethod(value as "paystack" | "card")
                  setValue("payment_method", value as "paystack" | "card")
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paystack">Paystack (Cards, Bank Transfer, etc.)</SelectItem>
                  <SelectItem value="card">Stripe (International Cards)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor_name">Name (Optional)</Label>
              <Input
                id="donor_name"
                type="text"
                placeholder="Your name"
                {...register("donor_name")}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donor_email">
                Email {paymentMethod === "paystack" && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="donor_email"
                type="email"
                placeholder="you@example.com"
                {...register("donor_email", {
                  required: paymentMethod === "paystack" ? "Email is required for Paystack payments" : false,
                })}
                disabled={isLoading}
              />
              {errors.donor_email && (
                <p className="text-sm text-destructive">
                  {errors.donor_email.message}
                </p>
              )}
              {paymentMethod === "paystack" && (
                <p className="text-xs text-muted-foreground">
                  Required for Paystack payment processing
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Processing..."
                : paymentMethod === "paystack"
                ? "Pay with Paystack"
                : "Pay with Stripe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

