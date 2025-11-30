"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { campaignSchema } from "@/lib/validations"
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
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"
import { generateSlug } from "@/lib/utils"
import dynamic from "next/dynamic"
import Image from "next/image"
import type { z } from "zod"

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

type CampaignForm = z.infer<typeof campaignSchema>

const STEPS = ["Details", "Image", "Category"] as const

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { data: session } = useSession()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CampaignForm & { description: string }>({
    resolver: zodResolver(campaignSchema),
    mode: "onChange",
    defaultValues: {
      description: "",
    },
  })

  const description = watch("description")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    try {
      const formData = new FormData()
      formData.append("file", imageFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handleNext = async () => {
    let isValid = false

    // Validate only the current step's fields
    if (currentStep === 0) {
      // Step 1: Validate title, goal_amount, and description
      isValid = await trigger(["title", "goal_amount", "description"])
    } else if (currentStep === 1) {
      // Step 2: Image is optional, so just advance
      isValid = true
    } else if (currentStep === 2) {
      // Step 3: Validate category
      isValid = await trigger(["category"])
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const onSubmit = async (data: CampaignForm & { description: string }) => {
    // This only runs on the final step

    setIsLoading(true)
    try {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to create a campaign")
      }

      // Upload image
      const imageUrl = await uploadImage()

      // Create campaign via API
      const response = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          goal_amount: data.goal_amount,
          description: data.description,
          image_url: imageUrl,
          category: data.category,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create campaign")
      }

      const { campaign } = await response.json()

      toast({
        title: "Success",
        description: "Campaign created successfully!",
      })

      router.push(`/campaign/${campaign.slug}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Start your fundraising journey in {STEPS.length} simple steps
        </p>
      </div>

      <div className="mb-6">
        <Progress value={((currentStep + 1) / STEPS.length) * 100} />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Enter your campaign details"}
            {currentStep === 1 && "Upload a campaign image"}
            {currentStep === 2 && "Select a category"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    disabled={isLoading}
                    placeholder="e.g., Help John's Medical Treatment"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal_amount">Goal Amount (KES)</Label>
                  <Input
                    id="goal_amount"
                    type="number"
                    step="0.01"
                    {...register("goal_amount", { valueAsNumber: true })}
                    disabled={isLoading}
                    placeholder="100000"
                  />
                  {errors.goal_amount && (
                    <p className="text-sm text-destructive">
                      {errors.goal_amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={(value) => setValue("description", value)}
                    className="bg-background"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Campaign Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                  {imagePreview && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("category", value as CampaignForm["category"])
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="charity">Charity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading} className="ml-auto">
                  {isLoading ? "Creating..." : "Create Campaign"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

