"use client"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VoiceRecorderProps {
  transcription: string
  isRecording: boolean
  onTranscriptionChange: (text: string) => void
  onRecordingChange: (recording: boolean) => void
  onGenerateImage: (prompt: string) => void
  isGenerating: boolean
  credits: number
  apiKey: string
}

export function VoiceRecorder({
  transcription,
  isRecording,
  onTranscriptionChange,
  onRecordingChange,
  onGenerateImage,
  isGenerating,
  credits,
  apiKey,
}: VoiceRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const transcriptionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const imageGenerationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const currentTranscriptionRef = useRef("")
  const isTranscribingRef = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsInitialized(true)
      console.log("[v0] Audio recording initialized")
    } else {
      setError("Audio recording is not supported in this browser. Please use a modern browser like Chrome or Edge.")
      console.error("[v0] MediaRecorder not supported")
    }

    return () => {
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current)
      }
      if (imageGenerationIntervalRef.current) {
        clearInterval(imageGenerationIntervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    currentTranscriptionRef.current = transcription
  }, [transcription])

  const startRecording = async () => {
    try {
      console.log("[v0] Requesting microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })
      streamRef.current = stream
      console.log("[v0] Microphone access granted, stream active:", stream.active)

      let mimeType = "audio/webm"
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/mp4"
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ""
        }
      }
      console.log("[v0] Using mime type:", mimeType || "default")

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        console.log("[v0] ondataavailable fired, data size:", event.data.size, "state:", mediaRecorder.state)
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log("[v0] Audio chunk added, total chunks:", audioChunksRef.current.length)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("[v0] MediaRecorder error:", event)
        setError("Recording error occurred. Please try again.")
      }

      mediaRecorder.onstart = () => {
        console.log("[v0] MediaRecorder started event fired")
      }

      mediaRecorder.onstop = () => {
        console.log("[v0] MediaRecorder stopped event fired")
      }

      mediaRecorder.start(1000)
      console.log("[v0] MediaRecorder.start() called with 1000ms timeslice")

      setTimeout(() => {
        console.log("[v0] MediaRecorder state after start:", mediaRecorder.state)
        if (mediaRecorder.state !== "recording") {
          console.error("[v0] ERROR: MediaRecorder failed to start!")
        }
      }, 100)

      transcriptionIntervalRef.current = setInterval(async () => {
        console.log(
          "[v0] Transcription interval tick - chunks:",
          audioChunksRef.current.length,
          "transcribing:",
          isTranscribingRef.current,
        )

        // Skip if already transcribing
        if (isTranscribingRef.current) {
          console.log("[v0] Skipping - already transcribing")
          return
        }

        // Check if we have chunks to transcribe
        if (audioChunksRef.current.length === 0) {
          console.log("[v0] No chunks available for transcription")
          return
        }

        // Copy and clear chunks
        const chunksToTranscribe = [...audioChunksRef.current]
        audioChunksRef.current = []
        console.log("[v0] Processing", chunksToTranscribe.length, "chunks")

        const audioBlob = new Blob(chunksToTranscribe, { type: mimeType || "audio/webm" })
        console.log("[v0] Created audio blob:", audioBlob.size, "bytes")

        if (audioBlob.size > 1000) {
          await transcribeAudio(audioBlob)
        } else {
          console.log("[v0] Blob too small, skipping")
        }
      }, 2000)

      imageGenerationIntervalRef.current = setInterval(() => {
        const currentText = currentTranscriptionRef.current.trim()
        console.log("[v0] Image generation check - transcript length:", currentText.length)

        if (currentText.length >= 3) {
          if (credits > 0 || apiKey) {
            console.log("[v0] Triggering image generation")
            onGenerateImage(currentText)
          } else {
            console.log("[v0] No credits/API key, stopping image generation")
            if (imageGenerationIntervalRef.current) {
              clearInterval(imageGenerationIntervalRef.current)
              imageGenerationIntervalRef.current = null
            }
          }
        }
      }, 1500)

      // Reset state
      onTranscriptionChange("")
      currentTranscriptionRef.current = ""
      setError(null)
      onRecordingChange(true)
      console.log("[v0] Recording started successfully")
    } catch (err) {
      console.error("[v0] Error starting recording:", err)
      setError("Microphone access denied. Please allow microphone permissions in your browser settings.")
      onRecordingChange(false)
    }
  }

  const stopRecording = () => {
    console.log("[v0] Stopping recording...")

    if (transcriptionIntervalRef.current) {
      clearInterval(transcriptionIntervalRef.current)
      transcriptionIntervalRef.current = null
    }

    if (imageGenerationIntervalRef.current) {
      clearInterval(imageGenerationIntervalRef.current)
      imageGenerationIntervalRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    onRecordingChange(false)
    console.log("[v0] Recording stopped")
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    isTranscribingRef.current = true

    try {
      console.log("[v0] Transcribing audio blob:", audioBlob.size, "bytes")

      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Transcription response:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Transcription error:", errorText)
        throw new Error(`Transcription failed: ${response.status}`)
      }

      const data = await response.json()
      const newText = data.text || ""
      console.log("[v0] Transcription result:", newText)

      if (newText.trim()) {
        const currentText = currentTranscriptionRef.current
        const updatedTranscription = currentText ? currentText + " " + newText : newText
        const cleanedTranscription = updatedTranscription.trim()

        console.log("[v0] Updated transcription:", cleanedTranscription)
        currentTranscriptionRef.current = cleanedTranscription
        onTranscriptionChange(cleanedTranscription)
      }
    } catch (err) {
      console.error("[v0] Transcription error:", err)
    } finally {
      isTranscribingRef.current = false
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full lg:h-auto">
      <div className="flex-1 min-h-[120px] lg:min-h-[200px] p-4 rounded-lg border overflow-y-auto bg-background shadow-none">
        {transcription ? (
          <p className="text-sm text-foreground whitespace-pre-wrap">{transcription}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isRecording ? "Listening... Start speaking to generate images" : "Click the mic to start recording"}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 mt-auto lg:mt-0">
        <Button
          onClick={toggleRecording}
          size="lg"
          className="w-full gap-2 text-base h-11"
          variant={isRecording ? "destructive" : "default"}
          disabled={!isInitialized}
        >
          {isRecording ? (
            <>
              <Square className="w-5 h-5" />
              Stop recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start recording
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {credits > 0 ? (
            <span>
              <span className="font-semibold text-foreground">{credits}</span> free credits remaining today
            </span>
          ) : apiKey ? (
            <span>
              Using <span className="font-semibold text-foreground">your API key</span> • Unlimited generations
            </span>
          ) : (
            <span className="text-destructive font-semibold">No credits remaining • Add API key to continue</span>
          )}
        </p>
      </div>
    </div>
  )
}
