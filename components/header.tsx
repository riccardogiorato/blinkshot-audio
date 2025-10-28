"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Key, GithubIcon,Star } from "lucide-react"
import { useState, useEffect } from "react"

interface HeaderProps {
  onOpenApiModal: () => void
  credits: number
}

export function Header({ onOpenApiModal, credits }: HeaderProps) {
  const [starCount, setStarCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const GITHUB_REPO = "username/audio-blinkshot" // TODO: Update with actual repo

  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`)
        if (response.ok) {
          const data = await response.json()
          setStarCount(data.stargazers_count)
        } else {
          setStarCount(0)
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error)
        setStarCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStarCount()
  }, [])

  return (
    <header className="border-b border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src="/images/design-mode/Logo-audioblinkshot.svg"
          alt="Audio Blinkshot"
          width={32}
          height={32}
          className="h-6 w-6"
        />
        <div className="h-6 w-px bg-border" />
        <a
          href="https://together.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-0.5 hover:opacity-80 transition-opacity"
        >
          <span className="text-xs text-muted-foreground font-light">Made by:</span>
          <Image
            src="/images/design-mode/Together-logo.svg"
            alt="Together AI"
            width={100}
            height={20}
            className="h-4 w-auto"
          />
        </a>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenApiModal} className="gap-2 bg-transparent shadow-none">
          <Key className="w-4 h-4" />
          <span className="hidden sm:inline">API Key</span>
          <span className="text-xs text-muted-foreground">({credits} credits)</span>
        </Button>

        <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent shadow-none">
          <a href={`https://github.com/${GITHUB_REPO}`} target="_blank" rel="noopener noreferrer">
            <GithubIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{isLoading ? "..." : starCount?.toLocaleString() || "0"}</span>
          </a>
        </Button>
      </div>
    </header>
  )
}
