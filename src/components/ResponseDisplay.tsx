'use client';

import { MarkdownContent } from '@/components/MarkdownContent';
import { Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState, useCallback } from 'react';

interface ResponseDisplayProps {
  content: string;
  isLoading?: boolean;
  error?: string;
}

export function ResponseDisplay({ content, isLoading, error }: ResponseDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [content]);

  if (!content && !isLoading && !error) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-8">
        <div className="text-center">
          <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground/30 mb-3" />
          <p className="text-base">Your build plan will appear here</p>
          <p className="text-sm mt-1">Describe your idea and select integrations to get started</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-destructive p-8">
        <div className="text-center">
          <p className="font-medium">Failed to generate response</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" className="mt-3" size="sm" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-2 pb-2 border-b flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Generated Build Plan</span>
        <div className="flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            disabled={isLoading || !content}
            aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
            className="h-7 w-7"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      <Separator className="flex-shrink-0" />
      <div className="prose prose-neutral dark:prose-invert max-w-none flex-1 overflow-y-auto p-2">
        <MarkdownContent content={content} />
      </div>
    </div>
  );
}