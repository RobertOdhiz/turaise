"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

const testimonials = [
  {
    name: "Sarah Wanjiku",
    role: "Medical Campaign Creator",
    content:
      "TuFund helped me raise funds for my mother's surgery. The Paystack integration made it so easy for friends and family to contribute. We reached our goal in just 2 weeks!",
  },
  {
    name: "James Ochieng",
    role: "Education Campaign Creator",
    content:
      "As a teacher, I needed funds for school supplies. TuFund's real-time tracking kept me motivated, and the sharing features helped spread the word quickly.",
  },
  {
    name: "Amina Hassan",
    role: "Business Campaign Creator",
    content:
      "Starting my small business was made possible through TuFund. The platform is secure, easy to use, and the support team is always helpful. Highly recommend!",
  },
]

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      <motion.div
        key={current}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-lg mb-4 italic">
              &ldquo;{testimonials[current].content}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold">{testimonials[current].name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonials[current].role}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === current ? "bg-primary" : "bg-muted"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

