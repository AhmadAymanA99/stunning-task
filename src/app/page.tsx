'use client';

import { useState, useCallback } from 'react';
import { PromptInput } from '@/components/PromptInput';
import { IntegrationSelector } from '@/components/IntegrationSelector';
import { ResponseDisplay } from '@/components/ResponseDisplay';
import { INTEGRATIONS } from '@/lib/integrations';
import { Sparkles, Zap, Shield, Code } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
              // ignore parse errors
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Build Planner</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Describe your idea, get a{' '}
              <span className="text-primary">production-ready plan</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Input your concept, select integrations, and receive a detailed technical specification
              with architecture, code examples, and implementation steps — powered by GPT-4o.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                <Zap className="h-4 w-4" />
                Fast streaming responses
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                <Shield className="h-4 w-4" />
                Production-focused
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                <Code className="h-4 w-4" />
                Ready-to-use code
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Builder */}
      <main className="container mx-auto px-4 py-10 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-5">
            <Card className="sticky top-24 h-fit">
              <CardContent className="p-6 space-y-6">
                <PromptInput
                  onSubmit={handleGenerate}
                  disabled={isLoading}
                />
                <Separator />
                <IntegrationSelector
                  integrations={INTEGRATIONS}
                  onChange={setSelectedIntegrations}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Response Panel */}
          <div className="lg:col-span-7">
            <ResponseDisplay
              content={response}
              isLoading={isLoading}
              error={error || undefined}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for Stunning Candidate Task — Next.js 15 + TypeScript + OpenAI GPT-4o</p>
        </div>
      </footer>
    </div>
  );
}