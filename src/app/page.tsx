'use client';

import { useState, useCallback } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { IntegrationSelector } from '@/components/IntegrationSelector';
import { ResponseDisplay } from '@/components/ResponseDisplay';
import { INTEGRATIONS } from '@/lib/integrations';
import { Sparkles, Zap, Shield, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  const handleGenerate = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, selectedIntegrations }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setResponse(fullContent);
                }
              } catch {
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [selectedIntegrations]);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Compact Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Stunning Builder</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" />Streaming</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Production-ready</span>
            <span className="flex items-center gap-1"><Code className="h-3 w-3" />Code output</span>
          </div>
        </div>
      </header>

      {/* Main Layout - Full Height */}
      <main className="flex-1 overflow-hidden container mx-auto px-4 py-4">
        <div className="h-full grid lg:grid-cols-[1fr_1.2fr] gap-4">
          {/* Left Panel - Input */}
          <div className="flex flex-col h-full min-h-0">
            <Card className="flex-1 flex flex-col h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-base">Build Your Spec</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-5">
                <PromptInput
                  onSubmit={handleGenerate}
                  disabled={isLoading}
                />
                <Separator className="my-2" />
                <IntegrationSelector
                  integrations={INTEGRATIONS}
                  onChange={setSelectedIntegrations}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Result */}
          <div className="h-full min-h-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-base">
                  {isLoading ? (
                    'Generating...'
                  ) : response ? (
                    'Generated Spec'
                  ) : (
                    'Output'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 pt-2">
                <ResponseDisplay
                  content={response}
                  isLoading={isLoading}
                  error={error || undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t py-2 bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Next.js 15 + TypeScript + Groq (Llama 3.1 70B)
        </div>
      </footer>
    </div>
  );
}