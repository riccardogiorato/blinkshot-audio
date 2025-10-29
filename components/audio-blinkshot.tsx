"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { ImageMoodSelector } from "@/components/image-mood-selector";
import { VoiceRecorder } from "@/components/voice-recorder";
import { ImagePreview } from "@/components/image-preview";
import { ImageHistory } from "@/components/image-history";
import { ApiKeyModal } from "@/components/api-key-modal";
import { toast } from "./ui/use-toast";

export type ImageMood =
  | "Hyperrealism"
  | "Anime"
  | "Pixel Art"
  | "Portrait"
  | "Artistic"
  | "Minimal"
  | "Random";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export default function AudioBlinkshot() {
  const [selectedMood, setSelectedMood] = useState<ImageMood>("Hyperrealism");
  const [transcription, setTranscription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("audio-blinkshot-api-key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setCredits(-1);
    } else {
      fetch("/api/limits")
        .then((res) => res.json())
        .then((data) => setCredits(data.remaining))
        .catch(() => setCredits(0));
    }
  }, []);

  const handleGenerateImage = async (prompt: string) => {
    if (credits !== null && credits <= 0 && !apiKey) {
      setIsModalOpen(true);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${selectedMood} style: ${prompt}`,
          apiKey: apiKey || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate image";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (response.status === 402) {
            errorMessage = "No credits remaining. Please add an API key or wait for credits to reset.";
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please wait a moment before trying again.";
          }
        } catch {
          // If we can't parse the error response, use status text
          errorMessage = response.statusText || errorMessage;
        }
        toast({
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt,
        timestamp: Date.now(),
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
      setCurrentImageIndex(0);

      if (!apiKey) {
        setCredits(null);
        fetch("/api/limits")
          .then((res) => res.json())
          .then((data) => setCredits(data.remaining));
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    if (key.trim()) {
      setApiKey(key.trim());
      localStorage.setItem("audio-blinkshot-api-key", key.trim());
      setCredits(-1);
    } else {
      setApiKey("");
      localStorage.removeItem("audio-blinkshot-api-key");
      setCredits(null);
      fetch("/api/limits")
        .then((res) => res.json())
        .then((data) => setCredits(data.remaining))
        .catch(() => setCredits(0));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen max-h-screen bg-background flex flex-col overflow-hidden">
      <Header onOpenApiModal={() => setIsModalOpen(true)} credits={credits} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Mobile: sticky bottom, Desktop: sidebar with button at bottom */}
        <aside className="w-full lg:w-96 border-r flex flex-col gap-6 order-2 lg:order-1 lg:overflow-y-auto">
          <div className="lg:p-6 p-4 pb-safe lg:pb-6 bg-background lg:bg-transparent border-t lg:border-t-0 flex flex-col lg:flex-1 lg:justify-between">
            <div className="lg:mb-6 mb-4">
              <ImageMoodSelector
                selectedMood={selectedMood}
                onSelectMood={setSelectedMood}
              />
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
          <ImagePreview
            image={generatedImages[currentImageIndex]}
            isGenerating={isGenerating}
          />

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
  );
}
