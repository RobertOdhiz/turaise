import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fundraise Easily with Paystack | Your Crowdfund App",
  description:
    "Create and support crowdfunding campaigns. Accept donations via Paystack and international cards. Real-time tracking and secure payments.",
  keywords: ["crowdfunding", "Paystack", "fundraising", "donations"],
  authors: [{ name: "TuFund" }],
  openGraph: {
    title: "Fundraise Easily with Paystack | Your Crowdfund App",
    description:
      "Create and support crowdfunding campaigns. Accept donations via Paystack and international cards.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

