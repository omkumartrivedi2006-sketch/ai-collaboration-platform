import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { Request } from 'express';

export class SessionService {
  async trackSession(userId: string, req: Request) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const uaString = req.headers['user-agent'] || '';
    
    let browser = 'Unknown Browser';
    let device = 'Desktop';

    if (/firefox/i.test(uaString)) {
      browser = 'Mozilla Firefox';
    } else if (/chrome|crios/i.test(uaString)) {
      browser = 'Google Chrome';
    } else if (/safari/i.test(uaString)) {
      browser = 'Apple Safari';
    } else if (/opr\//i.test(uaString)) {
      browser = 'Opera';
    } else if (/edg/i.test(uaString)) {
      browser = 'Microsoft Edge';
    }

    if (/mobile|android|iphone|ipad|phone/i.test(uaString)) {
      device = 'Mobile Device';
    }

    // Check if session with this exact device/ip is already tracked to update lastActive
    const existingSession = await prisma.userSession.findFirst({
      where: { userId, ipAddress, browser, device }
    });

    if (existingSession) {
      return prisma.userSession.update({
        where: { id: existingSession.id },
        data: { lastActive: new Date() }
      });
    }

    return prisma.userSession.create({
      data: {
        userId,
        device,
        browser,
        ipAddress,
        location: 'Local Network',
        lastActive: new Date()
      }
    });
  }

  async getSessions(userId: string) {
    return prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' }
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.userId !== userId) {
      throw new AppError('Unauthorized to revoke this session', 403);
    }

    return prisma.userSession.delete({
      where: { id: sessionId }
    });
  }

  async revokeOtherSessions(userId: string, activeSessionId: string) {
    return prisma.userSession.deleteMany({
      where: {
        userId,
        NOT: { id: activeSessionId }
      }
    });
  }
}
