import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Use user's API key or default (you would need to add a default key for free credits)
    const togetherApiKey = apiKey || process.env.TOGETHER_API_KEY

    if (!togetherApiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    console.log("[v0] Generating image with prompt:", prompt.substring(0, 50) + "...")

    const response = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${togetherApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: prompt,
        width: 1024,
        height: 768,
        steps: 4,
        n: 1,
      }),
    })

    const contentType = response.headers.get("content-type")
    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Together AI API error:", response.status, errorText)
      
      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(
          { error: errorJson.error?.message || "Failed to generate image" },
          { status: response.status }
        )
      } catch {
        return NextResponse.json(
          { error: `API error: ${errorText.substring(0, 100)}` },
          { status: response.status }
        )
      }
    }

    if (!contentType?.includes("application/json")) {
      const text = await response.text()
      console.error("[v0] Unexpected response type:", contentType, text.substring(0, 100))
      return NextResponse.json({ error: "Unexpected response from API" }, { status: 500 })
    }

    const data = await response.json()
    console.log("[v0] Image generated successfully")
    
    const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json

    if (!imageUrl) {
      console.error("[v0] No image URL in response:", data)
      return NextResponse.json({ error: "No image URL in response" }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("[v0] Error in generate-image route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
