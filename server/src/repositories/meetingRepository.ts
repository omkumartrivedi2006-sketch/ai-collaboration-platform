import prisma from '../config/db';
import { Meeting, MeetingParticipant, MeetingChatMessage, MeetingAttachment, MeetingStatus, AttendanceStatus, ParticipantRole, Prisma } from '@prisma/client';

export class MeetingRepository {
  async create(data: Prisma.MeetingUncheckedCreateInput): Promise<Meeting> {
    return prisma.meeting.create({ data });
  }

  async findById(id: string): Promise<any> {
    return prisma.meeting.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        project: {
          select: { id: true, name: true, code: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        attachments: {
          include: {
            file: {
              select: { id: true, name: true, url: true, extension: true, size: true }
            },
            uploader: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });
  }

  async update(id: string, data: Prisma.MeetingUncheckedUpdateInput): Promise<Meeting> {
    return prisma.meeting.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<Meeting> {
    return prisma.meeting.delete({
      where: { id }
    });
  }

  async listMeetings(userId: string, projectId?: string, status?: MeetingStatus): Promise<any[]> {
    const whereClause: Prisma.MeetingWhereInput = {};

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (status) {
      whereClause.status = status;
    }

    // A user can view a meeting if they are the organizer, or if they are invited/participating.
    // Also, if it is associated with a project they are a member of, they can view it.
    whereClause.OR = [
      { organizerId: userId },
      {
        participants: {
          some: { userId }
        }
      },
      {
        project: {
          members: {
            some: { userId }
          }
        }
      }
    ];

    return prisma.meeting.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        project: {
          select: { id: true, name: true, code: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  // Participants operations
  async findParticipant(meetingId: string, userId: string): Promise<MeetingParticipant | null> {
    return prisma.meetingParticipant.findUnique({
      where: {
        meetingId_userId: { meetingId, userId }
      }
    });
  }

  async addParticipant(data: Prisma.MeetingParticipantUncheckedCreateInput): Promise<MeetingParticipant> {
    return prisma.meetingParticipant.create({ data });
  }

  async updateParticipant(meetingId: string, userId: string, data: Prisma.MeetingParticipantUncheckedUpdateInput): Promise<MeetingParticipant> {
    return prisma.meetingParticipant.update({
      where: {
        meetingId_userId: { meetingId, userId }
      },
      data
    });
  }

  async deleteParticipant(meetingId: string, userId: string): Promise<MeetingParticipant> {
    return prisma.meetingParticipant.delete({
      where: {
        meetingId_userId: { meetingId, userId }
      }
    });
  }

  // Chat Operations
  async addChatMessage(data: Prisma.MeetingChatMessageUncheckedCreateInput): Promise<MeetingChatMessage> {
    return prisma.meetingChatMessage.create({
      data,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });
  }

  async getChatMessages(meetingId: string): Promise<any[]> {
    return prisma.meetingChatMessage.findMany({
      where: { meetingId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  // Attachment Operations
  async addAttachment(data: Prisma.MeetingAttachmentUncheckedCreateInput): Promise<MeetingAttachment> {
    return prisma.meetingAttachment.create({
      data,
      include: {
        file: {
          select: { id: true, name: true, url: true, extension: true, size: true }
        },
        uploader: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async getAttachments(meetingId: string): Promise<any[]> {
    return prisma.meetingAttachment.findMany({
      where: { meetingId },
      include: {
        file: {
          select: { id: true, name: true, url: true, extension: true, size: true }
        },
        uploader: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
export default MeetingRepository;
