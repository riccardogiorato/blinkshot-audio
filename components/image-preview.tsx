import type { GeneratedImage } from "@/components/audio-blinkshot";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface ImagePreviewProps {
  image?: GeneratedImage;
  isGenerating: boolean;
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
                    style={{
                      animationDelay: "150ms",
                      animationDuration: "1.2s",
                    }}
                  />
                  <div
                    className="w-1 h-3 bg-primary rounded-full animate-pulse"
                    style={{
                      animationDelay: "300ms",
                      animationDuration: "1.2s",
                    }}
                  />
                  <div
                    className="w-1 h-5 bg-primary rounded-full animate-pulse"
                    style={{
                      animationDelay: "450ms",
                      animationDuration: "1.2s",
                    }}
                  />
                  <div
                    className="w-1 h-4 bg-primary rounded-full animate-pulse"
                    style={{
                      animationDelay: "600ms",
                      animationDuration: "1.2s",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <h2 className="font-semibold text-foreground text-xl">
            Generate images with your voice
          </h2>
          <p className="text-muted-foreground text-sm">
            Click the mic, describe your vision, and watch the imagery unfold
          </p>
        </div>
      </div>
    );
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
          {/* Download button */}
          <button
            onClick={() => {
              window.open(image.url, '_blank');
            }}
            className="backdrop-blur-sm absolute right-2 top-2 rounded-lg border border-white/20 bg-white/60 p-2 shadow-lg transition hover:bg-white/70 focus:outline-none z-20 cursor-pointer"
            title="Download image"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 0C8.16321 0 8.31974 0.0648349 8.43514 0.180242C8.55055 0.295649 8.61539 0.452174 8.61539 0.615385V10.2072L11.2574 7.56513C11.3138 7.50467 11.3817 7.45617 11.4572 7.42254C11.5327 7.3889 11.6142 7.37082 11.6968 7.36936C11.7794 7.3679 11.8615 7.3831 11.9381 7.41405C12.0148 7.445 12.0844 7.49107 12.1428 7.54951C12.2012 7.60794 12.2473 7.67755 12.2783 7.75418C12.3092 7.8308 12.3244 7.91288 12.3229 7.99551C12.3215 8.07813 12.3034 8.15962 12.2698 8.23511C12.2361 8.31059 12.1876 8.37853 12.1272 8.43487L8.43487 12.1272C8.31949 12.2424 8.16308 12.3072 8 12.3072C7.83692 12.3072 7.68051 12.2424 7.56513 12.1272L3.87282 8.43487C3.81236 8.37853 3.76387 8.31059 3.73023 8.23511C3.6966 8.15962 3.67851 8.07813 3.67705 7.99551C3.6756 7.91288 3.69079 7.8308 3.72175 7.75418C3.7527 7.67755 3.79876 7.60794 3.8572 7.54951C3.91564 7.49107 3.98524 7.445 4.06187 7.41405C4.13849 7.3831 4.22057 7.3679 4.3032 7.36936C4.38583 7.37082 4.46731 7.3889 4.5428 7.42254C4.61829 7.45617 4.68623 7.50467 4.74256 7.56513L7.38462 10.2072V0.615385C7.38462 0.452174 7.44945 0.295649 7.56486 0.180242C7.68026 0.0648349 7.83679 0 8 0ZM0.615385 11.0769C0.778595 11.0769 0.93512 11.1418 1.05053 11.2572C1.16593 11.3726 1.23077 11.5291 1.23077 11.6923V13.5385C1.23077 13.8649 1.36044 14.1779 1.59125 14.4087C1.82207 14.6396 2.13512 14.7692 2.46154 14.7692H13.5385C13.8649 14.7692 14.1779 14.6396 14.4087 14.4087C14.6396 14.1779 14.7692 13.8649 14.7692 13.5385V11.6923C14.7692 11.5291 14.8341 11.3726 14.9495 11.2572C15.0649 11.1418 15.2214 11.0769 15.3846 11.0769C15.5478 11.0769 15.7044 11.1418 15.8198 11.2572C15.9352 11.3726 16 11.5291 16 11.6923V13.5385C16 14.1913 15.7407 14.8174 15.279 15.279C14.8174 15.7407 14.1913 16 13.5385 16H2.46154C1.8087 16 1.1826 15.7407 0.720968 15.279C0.25934 14.8174 0 14.1913 0 13.5385V11.6923C0 11.5291 0.0648349 11.3726 0.180242 11.2572C0.295649 11.1418 0.452174 11.0769 0.615385 11.0769Z"
                fill="black"
              />
            </svg>
          </button>
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
  );
}
