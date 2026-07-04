import { AIProvider, AICompletionResponse } from './aiProvider';
import { AppError } from '../../utils/AppError';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY || '';
    this.modelName = 'gemini-1.5-flash';
  }

  async generateCompletion(prompt: string, systemInstruction?: string): Promise<AICompletionResponse> {
    if (!this.apiKey) {
      throw new AppError('Gemini API key is not configured in environment variables.', 500);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const contents: any[] = [];
    
    let systemInstructionObj = undefined;
    if (systemInstruction) {
      systemInstructionObj = {
        parts: [{ text: systemInstruction }]
      };
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const payload = {
      contents,
      systemInstruction: systemInstructionObj,
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = (await response.json()) as any;
      const candidate = responseData?.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';
      
      const usageMetadata = responseData?.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const completionTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      return {
        text,
        promptTokens,
        completionTokens,
        totalTokens
      };
    } catch (error: any) {
      console.error('Gemini Provider API Error:', error.message);
      throw new AppError(`Gemini Provider: ${error.message}`, 502);
    }
  }
}
export default GeminiProvider;
