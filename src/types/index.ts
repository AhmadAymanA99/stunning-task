export interface Integration {
  id: string;
  name: string;
  description: string;
  systemPromptContext: string;
}

export interface GenerateRequest {
  prompt: string;
  selectedIntegrations: string[];
}

export interface GenerateResponse {
  content: string;
  error?: string;
}