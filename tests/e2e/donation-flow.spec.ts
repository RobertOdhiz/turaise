import { test, expect } from "@playwright/test"

test.describe("Donation Flow", () => {
  test("should display campaign page and donation form", async ({ page }) => {
    // Navigate to a campaign (assuming we have test data)
    await page.goto("/campaign/test-campaign")

    // Check that campaign details are visible
    await expect(page.locator("h1")).toBeVisible()
    await expect(page.getByText("Make a Donation")).toBeVisible()

    // Check donation form
    await expect(page.getByLabel("Amount (KES)")).toBeVisible()
    await expect(page.getByLabel("Payment Method")).toBeVisible()
  })

  test("should validate donation form", async ({ page }) => {
    await page.goto("/campaign/test-campaign")

    // Try to submit without amount
    await page.getByRole("button", { name: /Pay with/i }).click()

    // Should show validation error
    await expect(page.getByText(/Amount must be greater than 0/i)).toBeVisible()
  })
})

