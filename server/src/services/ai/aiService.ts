import prisma from '../../config/db';
import { PromptBuilder } from './promptBuilder';
import { ContextBuilder } from './contextBuilder';
import { GeminiProvider } from './geminiProvider';
import { OpenAIProvider } from './openaiProvider';
import { AIProvider } from './aiProvider';
import { AIRole, AIReportType } from '@prisma/client';
import { AppError } from '../../utils/AppError';

export class AIService {
  private promptBuilder = new PromptBuilder();
  private contextBuilder = new ContextBuilder();
  private activeProvider: AIProvider;
  private providerName: string;

  constructor() {
    this.providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    if (this.providerName === 'openai') {
      this.activeProvider = new OpenAIProvider();
    } else {
      this.activeProvider = new GeminiProvider();
    }
  }

  private async logRequest(
    userId: string,
    feature: string,
    promptTokens: number,
    completionTokens: number,
    totalTokens: number,
    responseTime: number,
    status: string
  ) {
    try {
      await prisma.aIRequestLog.create({
        data: {
          userId,
          feature,
          provider: this.providerName,
          promptTokens,
          completionTokens,
          totalTokens,
          responseTime,
          status
        }
      });
    } catch (e) {
      console.error('Failed to save AI request log:', e);
    }
  }

  async generateChatResponse(userId: string, conversationId: string | null, messageContent: string): Promise<any> {
    const startTime = Date.now();
    let conversation;

    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } }
      });
      if (!conversation) {
        throw new AppError('AI Conversation not found', 404);
      }
    } else {
      conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: messageContent.substring(0, 50) || 'New AI Chat'
        },
        include: { messages: true }
      });
    }

    // Save User message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: AIRole.USER,
        content: messageContent
      }
    });

    // Gather contextual information
    const userContext = await this.contextBuilder.buildUserContext(userId);

    // Build Prompt & System Instructions
    const { prompt, systemInstruction } = this.promptBuilder.buildChatAssistantPrompt(
      messageContent,
      userContext,
      conversation.messages
    );

    try {
      const response = await this.activeProvider.generateCompletion(prompt, systemInstruction);
      const responseTime = Date.now() - startTime;

      // Save Assistant message
      const assistantMessage = await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: AIRole.ASSISTANT,
          content: response.text,
          tokens: response.totalTokens
        }
      });

      // Update Conversation timestamp
      await prisma.aIConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      // Log request
      await this.logRequest(
        userId,
        'chat',
        response.promptTokens,
        response.completionTokens,
        response.totalTokens,
        responseTime,
        'SUCCESS'
      );

      return {
        conversationId: conversation.id,
        message: assistantMessage
      };
    } catch (error: any) {
      await this.logRequest(userId, 'chat', 0, 0, 0, Date.now() - startTime, 'ERROR');
      throw error;
    }
  }

  async summarizeMeeting(meetingId: string, userId: string): Promise<any> {
    const startTime = Date.now();
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        chatMessages: { include: { sender: { select: { name: true } } } },
        project: { select: { name: true } }
      }
    });

    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const chatText = meeting.chatMessages
      .map(c => `[${new Date(c.createdAt).toLocaleTimeString()}] ${c.sender.name}: ${c.message}`)
      .join('\n');

    const metadata = {
      title: meeting.title,
      projectName: meeting.project?.name || 'None'
    };

    const { prompt, systemInstruction } = this.promptBuilder.buildMeetingSummarizerPrompt(
      meeting.notes || '',
      chatText,
      metadata
    );

    try {
      const response = await this.activeProvider.generateCompletion(prompt, systemInstruction);
      const responseTime = Date.now() - startTime;

      // Save as Generated Report
      const report = await prisma.generatedReport.create({
        data: {
          meetingId,
          projectId: meeting.projectId,
          title: `Summary of: ${meeting.title}`,
          content: response.text,
          type: AIReportType.MEETING,
          generatedBy: userId
        }
      });

      await this.logRequest(
        userId,
        'meeting-summary',
        response.promptTokens,
        response.completionTokens,
        response.totalTokens,
        responseTime,
        'SUCCESS'
      );

      return report;
    } catch (error: any) {
      await this.logRequest(userId, 'meeting-summary', 0, 0, 0, Date.now() - startTime, 'ERROR');
      throw error;
    }
  }

  async generateTasks(summaryOrText: string, userId: string): Promise<any[]> {
    const startTime = Date.now();
    const { prompt, systemInstruction } = this.promptBuilder.buildTaskGeneratorPrompt(summaryOrText);

    try {
      const response = await this.activeProvider.generateCompletion(prompt, systemInstruction);
      const responseTime = Date.now() - startTime;

      let tasks: any[] = [];
      try {
        // Strip markdown backticks if returned
        let cleanText = response.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.substring(7, cleanText.length - 3);
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.substring(3, cleanText.length - 3);
        }
        tasks = JSON.parse(cleanText.trim());
      } catch (jsonErr) {
        console.error('Failed to parse AI JSON response:', response.text);
        throw new AppError('AI generated an invalid task list format.', 502);
      }

      await this.logRequest(
        userId,
        'task-generation',
        response.promptTokens,
        response.completionTokens,
        response.totalTokens,
        responseTime,
        'SUCCESS'
      );

      return tasks;
    } catch (error: any) {
      await this.logRequest(userId, 'task-generation', 0, 0, 0, Date.now() - startTime, 'ERROR');
      throw error;
    }
  }

  async generateProjectReport(projectId: string, reportType: AIReportType, userId: string): Promise<any> {
    const startTime = Date.now();
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignee: { select: { name: true } } }
    });

    const meetings = await prisma.meeting.findMany({
      where: { projectId }
    });

    const { prompt, systemInstruction } = this.promptBuilder.buildProjectReportPrompt(
      project,
      tasks,
      meetings,
      reportType
    );

    try {
      const response = await this.activeProvider.generateCompletion(prompt, systemInstruction);
      const responseTime = Date.now() - startTime;

      // Save Generated Report
      const report = await prisma.generatedReport.create({
        data: {
          projectId,
          title: `${reportType} Report - ${project.name}`,
          content: response.text,
          type: reportType,
          generatedBy: userId
        }
      });

      await this.logRequest(
        userId,
        'project-report',
        response.promptTokens,
        response.completionTokens,
        response.totalTokens,
        responseTime,
        'SUCCESS'
      );

      return report;
    } catch (error: any) {
      await this.logRequest(userId, 'project-report', 0, 0, 0, Date.now() - startTime, 'ERROR');
      throw error;
    }
  }

  async translateMessage(text: string, targetLanguage: string, userId: string): Promise<string> {
    const startTime = Date.now();
    const { prompt, systemInstruction } = this.promptBuilder.buildTranslationPrompt(text, targetLanguage);

    try {
      const response = await this.activeProvider.generateCompletion(prompt, systemInstruction);
      const responseTime = Date.now() - startTime;

      await this.logRequest(
        userId,
        'translation',
        response.promptTokens,
        response.completionTokens,
        response.totalTokens,
        responseTime,
        'SUCCESS'
      );

      return response.text.trim();
    } catch (error: any) {
      await this.logRequest(userId, 'translation', 0, 0, 0, Date.now() - startTime, 'ERROR');
      throw error;
    }
  }

  async summarizeDocument(content: string, filename: string, userId: string): Promise<any> {
    const startTime = Date.now();
    const { prompt, systemInstruction } = this.promptBuilder.buildDocumentSummarizerPrompt(content, filename);

    try {
      const response = await this.activeProvider.generateCompletion(prompt, systemInstruction);
      const responseTime = Date.now() - startTime;

      // Save Generated Report
      const report = await prisma.generatedReport.create({
        data: {
          title: `Summary of document: ${filename}`,
          content: response.text,
          type: AIReportType.TASK, // Use TASK or general type fallback
          generatedBy: userId
        }
      });

      await this.logRequest(
        userId,
        'document-summary',
        response.promptTokens,
        response.completionTokens,
        response.totalTokens,
        responseTime,
        'SUCCESS'
      );

      return report;
    } catch (error: any) {
      await this.logRequest(userId, 'document-summary', 0, 0, 0, Date.now() - startTime, 'ERROR');
      throw error;
    }
  }
}
export default AIService;
