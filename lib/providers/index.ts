import OpenAI from 'openai';

export interface ModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key',
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function getModelResponse(prompt: string, options?: ModelOptions): Promise<string> {
  // Use a modern Groq model since llama3-8b-8192 is decommissioned
  const model = options?.model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
  });

  return response.choices[0]?.message?.content || '';
}
