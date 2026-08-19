import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Groq from 'groq-sdk';
import { buildSystemPrompt } from '@/lib/prompt-builder';
import { getIntegrationsByIds } from '@/lib/integrations';
import { INTEGRATIONS } from '@/lib/integrations';

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }
  return new Groq({ apiKey });
}

const generateSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(2000),
  selectedIntegrations: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prompt, selectedIntegrations = [] } = validation.data;

    // Validate integration IDs
    const validIntegrationIds = INTEGRATIONS.map((i) => i.id);
    const invalidIds = selectedIntegrations.filter(
      (id) => !validIntegrationIds.includes(id)
    );
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid integration(s): ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    const integrations = getIntegrationsByIds(selectedIntegrations);
    const systemPrompt = buildSystemPrompt(integrations);

    const userPrompt = `Build a complete technical specification and implementation plan for:

${prompt}

${selectedIntegrations.length > 0
      ? `The user wants to integrate with: ${selectedIntegrations.join(', ')}. Include specific implementation details for these integrations.`
      : 'No specific integrations requested. Suggest appropriate ones if relevant.'}

Provide:
1. **Architecture Overview** - High-level system design
2. **Tech Stack Recommendations** - Specific technologies with versions
3. **File Structure** - Project organization
4. **Core Implementation** - Key code examples for critical paths
5. **Integration Details** - Auth, API calls, error handling for each selected integration
6. **Security Considerations** - Auth, data protection, secrets management
7. **Deployment & Operations** - CI/CD, monitoring, scaling
8. **Next Steps** - Immediate action items`;

    let groq: Groq;
    try {
      groq = getGroqClient();
    } catch {
      return NextResponse.json(
        { error: 'AI service not configured. Please contact administrator.' },
        { status: 503 }
      );
    }

    const stream = await groq.chat.completions.create({
      model: 'groq/compound',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Generation error:', error);

    if (error instanceof Groq.APIError) {
      return NextResponse.json(
        { error: `AI service error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}