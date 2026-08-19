'use client';

import { MarkdownContent } from '@/components/MarkdownContent';
import { Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground/30 mb-4" />
            <p className="text-lg">Your build plan will appear here</p>
            <p className="text-sm mt-1">Describe your idea and select integrations to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-destructive">
            <p className="font-medium">Failed to generate response</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" className="mt-4" size="sm">
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Generated Build Plan</CardTitle>
          <div className="flex items-center gap-2">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={isLoading || !content}
              aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MarkdownContent content={content} />
        </div>
      </CardContent>
    </Card>
  );
}