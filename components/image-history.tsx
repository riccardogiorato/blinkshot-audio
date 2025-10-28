"use client"

import type { GeneratedImage } from "@/components/audio-blinkshot"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageHistoryProps {
  images: GeneratedImage[]
  currentIndex: number
  onSelectImage: (index: number) => void
}

export function ImageHistory({ images, currentIndex, onSelectImage }: ImageHistoryProps) {
  return (
    <div className="mt-6 p-3">
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onSelectImage(index)}
            className={cn(
              "flex-shrink-0 w-28 h-28 rounded-xl border-2 transition-all hover:scale-105 p-1",
              currentIndex === index
                ? "border-primary ring-2 ring-primary"
                : "border-border hover:border-foreground/40",
            )}
          >
            <Image
              src={image.url || "/placeholder.svg"}
              alt={`Generated image ${index + 1}`}
              width={112}
              height={112}
              className="w-full h-full object-cover rounded-lg"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
