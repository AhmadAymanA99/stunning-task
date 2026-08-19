'use client';

import { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting || disabled) return;

    setIsSubmitting(true);
    try {
      onSubmit(prompt.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-3">
        <Label htmlFor="prompt" className="text-sm font-medium text-muted-foreground">
          What do you want to build?
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your idea... e.g., 'A SaaS dashboard with user authentication, Stripe subscriptions, and Slack notifications for new signups'"
          rows={4}
          className="resize-none"
          disabled={isSubmitting || disabled}
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {prompt.length}/2000 characters
          </span>
          <Button
            type="submit"
            disabled={!prompt.trim() || isSubmitting || disabled}
            className="gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Build
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}