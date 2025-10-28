import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  console.log("[v0] Transcribe API route called")

  try {
    const contentType = request.headers.get("content-type")
    console.log("[v0] Request content-type:", contentType)

    if (!contentType?.includes("multipart/form-data")) {
      console.error("[v0] Invalid content-type, expected multipart/form-data")
      return NextResponse.json({ error: "Invalid content-type. Expected multipart/form-data" }, { status: 400 })
    }

    const formData = await request.formData()
    console.log("[v0] FormData received, keys:", Array.from(formData.keys()))

    const audioFile = formData.get("audio")
    console.log("[v0] Audio file from formData:", audioFile ? "present" : "missing")

    if (!audioFile || !(audioFile instanceof File)) {
      console.error("[v0] No valid audio file in request")
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    console.log("[v0] Audio file details:", {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    })

    // Get API key from environment
    const apiKey = process.env.TOGETHER_API_KEY

    if (!apiKey) {
      console.error("[v0] TOGETHER_API_KEY not configured")
      return NextResponse.json({ error: "Together AI API key not configured" }, { status: 500 })
    }

    console.log("[v0] Preparing request to Together AI Whisper API...")

    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Create form data for Together AI
    const togetherFormData = new FormData()
    togetherFormData.append("file", audioBlob, audioFile.name || "audio.webm")
    togetherFormData.append("model", "openai/whisper-large-v3")

    console.log("[v0] Sending request to Together AI...")

    const response = await fetch("https://api.together.xyz/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: togetherFormData,
    })

    console.log("[v0] Together AI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Together AI error response:", errorText)
      return NextResponse.json(
        { error: `Transcription failed: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    const transcribedText = data.text || ""

    console.log("[v0] Transcription successful, text length:", transcribedText.length)
    console.log("[v0] Transcribed text preview:", transcribedText.substring(0, 100))

    return NextResponse.json({ text: transcribedText })
  } catch (error) {
    console.error("[v0] Transcription route error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to transcribe audio",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
