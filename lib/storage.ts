import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "campaigns")

/**
 * Upload file to local storage
 * In production, replace this with S3, Cloudinary, or similar
 */
export async function uploadFile(file: File, filename: string): Promise<string> {
  // Ensure upload directory exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filepath = join(UPLOAD_DIR, filename)
  await writeFile(filepath, buffer)

  // Return public URL
  return `/uploads/campaigns/${filename}`
}

/**
 * Delete file from storage
 */
export async function deleteFile(url: string): Promise<void> {
  if (url.startsWith("/uploads/")) {
    const filepath = join(process.cwd(), "public", url)
    const { unlink } = await import("fs/promises")
    try {
      await unlink(filepath)
    } catch (error) {
      // File might not exist, ignore
    }
  }
}

