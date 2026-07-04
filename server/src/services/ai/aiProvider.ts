export interface AICompletionResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIProvider {
  generateCompletion(prompt: string, systemInstruction?: string): Promise<AICompletionResponse>;
}
