import { AIProvider, AICompletionResponse } from './aiProvider';
import { AppError } from '../../utils/AppError';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.modelName = 'gpt-4o';
  }

  async generateCompletion(prompt: string, systemInstruction?: string): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new AppError('OpenAI API key is not configured in environment variables.', 500);
    }

    const url = 'https://api.openai.com/v1/chat/completions';

    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({
        role: 'system',
        content: systemInstruction
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    const payload = {
      model: this.modelName,
      messages,
      temperature: 0.2
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = (await response.json()) as any;
      const choice = responseData?.choices?.[0];
      const text = choice?.message?.content || '';

      const usage = responseData?.usage || {};
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      const totalTokens = usage.total_tokens || 0;

      return {
        text,
        promptTokens,
        completionTokens,
        totalTokens
      };
    } catch (error: any) {
      console.error('OpenAI Provider API Error:', error.message);
      throw new AppError(`OpenAI Provider: ${error.message}`, 502);
    }
  }
}
export default OpenAIProvider;
