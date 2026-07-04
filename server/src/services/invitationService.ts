import prisma from '../config/db';
import { Role, InvitationStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import crypto from 'crypto';

export class InvitationService {
  async createInvitation(email: string, role: Role, departmentId?: string) {
    // 1. Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw new AppError('This email is already registered in the platform', 400);
    }

    // 2. Check if a pending invitation already exists for this email
    const pendingInvite = await prisma.invitation.findFirst({
      where: {
        email,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() }
      }
    });
    if (pendingInvite) {
      throw new AppError('A pending invitation for this email already exists', 400);
    }

    // 3. Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // 4. Save invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        departmentId: departmentId || null,
        token,
        expiresAt,
        status: InvitationStatus.PENDING
      },
      include: {
        department: true
      }
    });

    return invitation;
  }

  async getInvitations() {
    return prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { department: true }
    });
  }

  async revokeInvitation(id: string) {
    const invite = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invite) {
      throw new AppError('Invitation not found', 404);
    }

    return prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED }
    });
  }

  async validateToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { department: true }
    });

    if (!invitation) {
      throw new AppError('Invalid invitation token', 404);
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new AppError(`Invitation has already been ${invitation.status.toLowerCase()}`, 400);
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED }
      });
      throw new AppError('Invitation token has expired', 400);
    }

    return invitation;
  }
}
