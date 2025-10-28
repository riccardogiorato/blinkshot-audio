"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ImageMoodSelector } from "@/components/image-mood-selector"
import { VoiceRecorder } from "@/components/voice-recorder"
import { ImagePreview } from "@/components/image-preview"
import { ImageHistory } from "@/components/image-history"
import { ApiKeyModal } from "@/components/api-key-modal"

export type ImageMood = "Hyperrealism" | "Anime" | "Pixel Art" | "Portrait" | "Artistic" | "Minimal" | "Random"

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: number
}

export default function AudioBlinkshot() {
  const [selectedMood, setSelectedMood] = useState<ImageMood>("Hyperrealism")
  const [transcription, setTranscription] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [credits, setCredits] = useState(15)
  const [apiKey, setApiKey] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Load credits and API key from localStorage on mount
  useEffect(() => {
    const storedCredits = localStorage.getItem("audio-blinkshot-credits")
    const storedApiKey = localStorage.getItem("audio-blinkshot-api-key")
    const lastResetDate = localStorage.getItem("audio-blinkshot-last-reset")

    const today = new Date().toDateString()

    // Reset credits daily
    if (lastResetDate !== today) {
      localStorage.setItem("audio-blinkshot-credits", "15")
      localStorage.setItem("audio-blinkshot-last-reset", today)
      setCredits(15)
    } else if (storedCredits) {
      setCredits(Number.parseInt(storedCredits, 10))
    }

    if (storedApiKey) {
      setApiKey(storedApiKey)
    }
  }, [])

  // Save credits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("audio-blinkshot-credits", credits.toString())
  }, [credits])

  const handleGenerateImage = async (prompt: string) => {
    if (credits <= 0 && !apiKey) {
      setIsModalOpen(true)
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${selectedMood} style: ${prompt}`,
          apiKey: credits <= 0 ? apiKey : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt,
        timestamp: Date.now(),
      }

      setGeneratedImages((prev) => [newImage, ...prev])
      setCurrentImageIndex(0)

      if (credits > 0) {
        setCredits((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("[v0] Error generating image:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem("audio-blinkshot-api-key", key)
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen max-h-screen bg-background flex flex-col overflow-hidden">
      <Header onOpenApiModal={() => setIsModalOpen(true)} credits={credits} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Mobile: sticky bottom, Desktop: sidebar with button at bottom */}
        <aside className="w-full lg:w-96 border-r flex flex-col gap-6 order-2 lg:order-1 lg:overflow-y-auto">
          <div className="lg:p-6 p-4 pb-safe lg:pb-6 bg-background lg:bg-transparent border-t lg:border-t-0 flex flex-col lg:flex-1 lg:justify-between">
            <div className="lg:mb-6 mb-4">
              <ImageMoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />
            </div>

            <VoiceRecorder
              transcription={transcription}
              isRecording={isRecording}
              onTranscriptionChange={setTranscription}
              onRecordingChange={setIsRecording}
              onGenerateImage={handleGenerateImage}
              isGenerating={isGenerating}
              credits={credits}
              apiKey={apiKey}
            />
          </div>
        </aside>

        {/* Right Panel - Mobile: scrollable top section, Desktop: normal */}
        <main className="flex-1 flex flex-col p-4 lg:p-8 overflow-y-auto order-1 lg:order-2">
          <ImagePreview image={generatedImages[currentImageIndex]} isGenerating={isGenerating} />

          {generatedImages.length > 0 && (
            <ImageHistory
              images={generatedImages}
              currentIndex={currentImageIndex}
              onSelectImage={setCurrentImageIndex}
            />
          )}
        </main>
      </div>

      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveApiKey}
        credits={credits}
        currentApiKey={apiKey}
      />
    </div>
  )
}
