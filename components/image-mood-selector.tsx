"use client";

import type { ImageMood } from "@/components/audio-blinkshot";
import { Button } from "@/components/ui/button";

interface ImageMoodSelectorProps {
  selectedMood: ImageMood;
  onSelectMood: (mood: ImageMood) => void;
}

const moods: ImageMood[] = [
  "Hyperrealism",
  "Anime",
  "Pixel Art",
  "Portrait",
  "Artistic",
  "Minimal",
  "Random",
];

export function ImageMoodSelector({
  selectedMood,
  onSelectMood,
}: ImageMoodSelectorProps) {
  return (
    <div>
      <h2 className="text-sm text-foreground mb-3 font-normal">Image mood:</h2>
      <div className="flex flex-wrap gap-2 shadow-none">
        {moods.map((mood) => (
          <Button
            key={mood}
            variant={selectedMood === mood ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectMood(mood)}
            className="rounded-full shadow-none font-normal border cursor-pointer"
          >
            {mood}
          </Button>
        ))}
      </div>
    </div>
  );
}
