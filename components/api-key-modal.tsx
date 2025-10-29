"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, ExternalLink, Eye, EyeOff } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  credits: number | null;
  currentApiKey: string;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  onSave,
  credits,
  currentApiKey,
}: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [buttonText, setButtonText] = useState("Save API Key");

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey || "");
    }
  }, [isOpen, currentApiKey]);

  useEffect(() => {
    setButtonText(apiKey.trim() ? "Save API Key" : "Remove API Key");
  }, [apiKey]);

  const handleSave = () => {
    onSave(apiKey);
    setApiKey("");
    setShowApiKey(false);
    setButtonText("Save API Key");
  };

  const handleClose = () => {
    setApiKey("");
    setShowApiKey(false);
    setButtonText("Save API Key");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-muted-foreground" />
            <DialogTitle className="font-medium">
              Add your Together AI API key
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Enter your API key to continue generating images after using your
            free credits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-0">
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              placeholder="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full shadow-none h-11 pr-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 bg-transparent shadow-none font-normal"
              asChild
            >
              <a
                href="https://api.together.xyz/settings/api-keys"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get your API key
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 shadow-none cursor-pointer"
            >
              {buttonText}
            </Button>
          </div>

          <p className="text-muted-foreground text-center text-xs">
            {credits === null ? "Loading credits..." : credits === -1 ? "Unlimited generations with your API key" : `You have ${credits} free credits remaining`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
