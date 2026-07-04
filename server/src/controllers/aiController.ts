import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai/aiService';
import { AIReportType } from '@prisma/client';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';

const aiService = new AIService();

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { conversationId, message } = req.body;

    const result = await aiService.generateChatResponse(userId, conversationId, message);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const summarizeMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { meetingId } = req.body;

    // Check permission: verify if user can access the meeting details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: true }
    });

    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }

    const isOrganizer = meeting.organizerId === userId;
    const isInvited = meeting.participants.some(p => p.userId === userId);
    if (!isOrganizer && !isInvited && req.user!.role !== 'Admin') {
      return next(new AppError('Unauthorized to summarize this meeting.', 403));
    }

    const report = await aiService.summarizeMeeting(meetingId, userId);

    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const generateTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { summaryOrText } = req.body;

    const tasks = await aiService.generateTasks(summaryOrText, userId);

    res.status(200).json({
      status: 'success',
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

export const projectReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { projectId, reportType } = req.body;

    // Validate Project membership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    const isMember = project.members.some(m => m.userId === userId) || project.managerId === userId || req.user!.role === 'Admin';
    if (!isMember) {
      return next(new AppError('Unauthorized to generate report for this project', 403));
    }

    const report = await aiService.generateProjectReport(projectId, reportType as AIReportType, userId);

    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const translate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { text, targetLanguage } = req.body;

    const translatedText = await aiService.translateMessage(text, targetLanguage, userId);

    res.status(200).json({
      status: 'success',
      data: { translatedText }
    });
  } catch (error) {
    next(error);
  }
};

export const documentSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { content, filename } = req.body;

    const report = await aiService.summarizeDocument(content, filename, userId);

    res.status(200).json({
      status: 'success',
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const conversations = await prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }

    if (conversation.userId !== userId && req.user!.role !== 'Admin') {
      return next(new AppError('Unauthorized access to conversation logs', 403));
    }

    const messages = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    // Fetch reports generated by this user or reports inside projects this user has access to
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          { members: { some: { userId } } }
        ]
      },
      select: { id: true }
    });

    const projectIds = projects.map(p => p.id);

    const reports = await prisma.generatedReport.findMany({
      where: {
        OR: [
          { generatedBy: userId },
          { projectId: { in: projectIds } }
        ]
      },
      include: {
        creator: { select: { id: true, name: true } },
        project: { select: { name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      data: { reports }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  chat,
  summarizeMeeting,
  generateTasks,
  projectReport,
  translate,
  documentSummary,
  getConversations,
  getConversationMessages,
  getReports
};
