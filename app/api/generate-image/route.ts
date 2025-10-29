import { ratelimitGenerations } from "@/lib/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import Together from "together-ai";

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use user's API key or default (you would need to add a default key for free credits)
    const togetherApiKey = apiKey || process.env.TOGETHER_API_KEY;

    if (!togetherApiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Rate limiting for users without API key
    if (!apiKey) {
      const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const { success } = await ratelimitGenerations.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error:
              "Rate limit exceeded. Please add your own API key for unlimited generations.",
          },
          { status: 429 }
        );
      }
    }

    console.log(
      "Generating image with prompt:",
      prompt.substring(0, 50) + "..."
    );

    const client = new Together({
      apiKey: togetherApiKey,
    });

    const response = await client.images.create({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt: prompt,
      width: 1024,
      height: 768,
      steps: 4,
      n: 1,
    });

    console.log("Image generated successfully");

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      console.error("No image URL in response:", response);
      return NextResponse.json(
        { error: "No image URL in response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error in generate-image route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
