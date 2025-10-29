import type { GeneratedImage } from "@/components/audio-blinkshot"
import { Loader2 } from "lucide-react"
import Image from "next/image"

interface ImagePreviewProps {
  image?: GeneratedImage
  isGenerating: boolean
}

export function ImagePreview({ image, isGenerating }: ImagePreviewProps) {
  if (!image && !isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-2xl border min-h-[400px] bg-background">
        <div className="text-center max-w-md px-4 space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            {/* Outer rotating ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin"
              style={{ animationDuration: "8s" }}
            />

            {/* Middle pulsing circle */}
            <div
              className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent animate-pulse"
              style={{ animationDuration: "3s" }}
            />

            {/* Inner static shapes */}
            <div className="absolute inset-8 flex items-center justify-center">
              <div className="relative w-full h-full">
                {/* Sound wave bars */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 items-center">
                  <div
                    className="w-1 h-4 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
                  />
                  <div
                    className="w-1 h-6 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: "150ms", animationDuration: "1.2s" }}
                  />
                  <div
                    className="w-1 h-3 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: "300ms", animationDuration: "1.2s" }}
                  />
                  <div
                    className="w-1 h-5 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: "450ms", animationDuration: "1.2s" }}
                  />
                  <div
                    className="w-1 h-4 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: "600ms", animationDuration: "1.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <h2 className="font-semibold text-foreground text-xl">Generate images with your voice</h2>
          <p className="text-muted-foreground text-sm">
            Click the mic, describe your vision, and watch the imagery unfold
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center rounded-2xl border overflow-hidden min-h-[400px] relative bg-muted">
      {isGenerating && !image && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
        </div>
      )}

      {image && (
        <>
          {/* Blurred background */}
          <Image
            src={image.url || "/placeholder.svg"}
            alt=""
            fill
            className="object-cover blur-sm scale-110"
            priority
          />
          {/* Main image */}
          <div className="relative max-w-full max-h-full animate-in fade-in duration-500 z-10">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.prompt}
              width={1024}
              height={1024}
              className="object-contain max-h-[600px] w-auto"
              priority
            />
          </div>
        </>
      )}
    </div>
  )
}
