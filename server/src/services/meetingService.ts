import { MeetingRepository } from '../repositories/meetingRepository';
import { NotificationService } from './notificationService';
import { Role, MeetingStatus, AttendanceStatus, ParticipantRole, Meeting } from '@prisma/client';
import { AppError } from '../utils/AppError';
import prisma from '../config/db';

export class MeetingService {
  private meetingRepository = new MeetingRepository();
  private notificationService = new NotificationService();

  async createMeeting(
    data: {
      title: string;
      description?: string;
      projectId?: string | null;
      startTime: string;
      endTime: string;
      timezone: string;
      invitedUserIds?: string[];
    },
    organizerId: string,
    role: Role
  ): Promise<Meeting> {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (start >= end) {
      throw new AppError('Start time must be before end time', 400);
    }

    // Generate unique Jitsi Room Name and Meeting Link
    const uuidSeed = Math.random().toString(36).substring(2, 10);
    const sanitizedTitle = data.title.replace(/[^a-zA-Z0-9]/g, '-');
    const roomName = `CollabSphere-${sanitizedTitle}-${uuidSeed}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;

    // Verify Project Context if projectId provided
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
        include: { members: true }
      });
      if (!project) {
        throw new AppError('Project context not found', 404);
      }
      
      const isMember = project.members.some(m => m.userId === organizerId) || project.managerId === organizerId || role === Role.Admin;
      if (!isMember) {
        throw new AppError('You must be a member of the project to schedule meetings inside it', 403);
      }
    }

    // Create Meeting
    const meeting = await this.meetingRepository.create({
      title: data.title,
      description: data.description || null,
      projectId: data.projectId || null,
      organizerId,
      meetingLink,
      startTime: start,
      endTime: end,
      timezone: data.timezone,
      status: MeetingStatus.SCHEDULED
    });

    // Add Organizer as Host
    await this.meetingRepository.addParticipant({
      meetingId: meeting.id,
      userId: organizerId,
      role: ParticipantRole.HOST,
      attendanceStatus: AttendanceStatus.ACCEPTED
    });

    // Invite members
    if (data.invitedUserIds && data.invitedUserIds.length > 0) {
      // Filter out organizer if included in invited list
      const cleanUserIds = data.invitedUserIds.filter(id => id !== organizerId);
      
      for (const targetUserId of cleanUserIds) {
        await this.meetingRepository.addParticipant({
          meetingId: meeting.id,
          userId: targetUserId,
          role: ParticipantRole.PARTICIPANT,
          attendanceStatus: AttendanceStatus.INVITED
        });

        // Smart dispatch notification
        await this.notificationService.createNotification({
          userId: targetUserId,
          title: 'Meeting Scheduled',
          description: `You have been invited to "${meeting.title}" on ${start.toLocaleDateString()}`,
          type: 'SYSTEM',
          actionUrl: `/meetings`
        });
      }
    }

    return meeting;
  }

  async getMeetingDetails(id: string, userId: string, role: Role): Promise<any> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    // Verify Access: Organizer, invited participant, or project member can view
    const isOrganizer = meeting.organizerId === userId;
    const isParticipant = meeting.participants.some((p: any) => p.userId === userId);
    let isProjectMember = false;

    if (meeting.projectId) {
      const projectMember = await prisma.projectMember.findFirst({
        where: { projectId: meeting.projectId, userId }
      });
      const project = await prisma.project.findUnique({
        where: { id: meeting.projectId }
      });
      isProjectMember = !!projectMember || project?.managerId === userId;
    }

    if (!isOrganizer && !isParticipant && !isProjectMember && role !== Role.Admin) {
      throw new AppError('Unauthorized to view this meeting details', 403);
    }

    return meeting;
  }

  async updateMeeting(
    id: string,
    data: {
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      timezone?: string;
      notes?: string;
    },
    userId: string,
    role: Role
  ): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    // Only host/organizer or admin can update meeting details
    const isOrganizer = meeting.organizerId === userId;
    const hostParticipant = meeting.participants.find((p: any) => p.userId === userId && p.role === ParticipantRole.HOST);
    if (!isOrganizer && !hostParticipant && role !== Role.Admin) {
      throw new AppError('Unauthorized to modify meeting settings', 403);
    }

    const updateData: any = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);

    if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
      throw new AppError('Start time must be before end time', 400);
    }

    const updated = await this.meetingRepository.update(id, updateData);

    // Notify all participants about updates
    for (const p of meeting.participants) {
      if (p.userId !== userId) {
        await this.notificationService.createNotification({
          userId: p.userId,
          title: 'Meeting Updated',
          description: `Meeting "${meeting.title}" details have been updated.`,
          type: 'SYSTEM',
          actionUrl: `/meetings`
        });
      }
    }

    return updated;
  }

  async cancelMeeting(id: string, userId: string, role: Role): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const isOrganizer = meeting.organizerId === userId;
    if (!isOrganizer && role !== Role.Admin) {
      throw new AppError('Only the meeting organizer or an admin can cancel the meeting', 403);
    }

    const cancelled = await this.meetingRepository.update(id, { status: MeetingStatus.CANCELLED });

    // Notify participants
    for (const p of meeting.participants) {
      if (p.userId !== userId) {
        await this.notificationService.createNotification({
          userId: p.userId,
          title: 'Meeting Cancelled',
          description: `Meeting "${meeting.title}" has been cancelled.`,
          type: 'SYSTEM',
          actionUrl: `/meetings`
        });
      }
    }

    return cancelled;
  }

  async deleteMeeting(id: string, userId: string, role: Role): Promise<Meeting> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const isOrganizer = meeting.organizerId === userId;
    if (!isOrganizer && role !== Role.Admin) {
      throw new AppError('Only the meeting organizer or an admin can delete the meeting', 403);
    }

    return this.meetingRepository.delete(id);
  }

  async duplicateMeeting(id: string, userId: string, role: Role): Promise<Meeting> {
    const original = await this.meetingRepository.findById(id);
    if (!original) {
      throw new AppError('Meeting not found', 404);
    }

    const uuidSeed = Math.random().toString(36).substring(2, 10);
    const roomName = `CollabSphere-${original.title.replace(/[^a-zA-Z0-9]/g, '-')}-${uuidSeed}`;
    const meetingLink = `https://meet.jit.si/${roomName}`;

    // Create a new meeting instance using original settings
    const duplicated = await this.meetingRepository.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      projectId: original.projectId,
      organizerId: userId,
      meetingLink,
      startTime: original.startTime,
      endTime: original.endTime,
      timezone: original.timezone,
      status: MeetingStatus.SCHEDULED
    });

    // Add Organizer as Host
    await this.meetingRepository.addParticipant({
      meetingId: duplicated.id,
      userId,
      role: ParticipantRole.HOST,
      attendanceStatus: AttendanceStatus.ACCEPTED
    });

    return duplicated;
  }

  async inviteMembers(id: string, invitedUserIds: string[], userId: string, role: Role): Promise<void> {
    const meeting = await this.meetingRepository.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const isOrganizer = meeting.organizerId === userId;
    const isHost = meeting.participants.some((p: any) => p.userId === userId && p.role === ParticipantRole.HOST);

    if (!isOrganizer && !isHost && role !== Role.Admin) {
      throw new AppError('Only meeting hosts can invite participants', 403);
    }

    for (const targetUserId of invitedUserIds) {
      const exists = meeting.participants.some((p: any) => p.userId === targetUserId);
      if (!exists) {
        await this.meetingRepository.addParticipant({
          meetingId: meeting.id,
          userId: targetUserId,
          role: ParticipantRole.PARTICIPANT,
          attendanceStatus: AttendanceStatus.INVITED
        });

        await this.notificationService.createNotification({
          userId: targetUserId,
          title: 'Meeting Invitation',
          description: `You are invited to join "${meeting.title}"`,
          type: 'SYSTEM',
          actionUrl: `/meetings`
        });
      }
    }
  }

  async respondInvitation(meetingId: string, userId: string, response: 'ACCEPT' | 'DECLINE'): Promise<any> {
    const participant = await this.meetingRepository.findParticipant(meetingId, userId);
    if (!participant) {
      throw new AppError('You are not invited to this meeting', 404);
    }

    const status = response === 'ACCEPT' ? AttendanceStatus.ACCEPTED : AttendanceStatus.DECLINED;
    return this.meetingRepository.updateParticipant(meetingId, userId, { attendanceStatus: status });
  }

  async joinMeeting(meetingId: string, userId: string, role: Role): Promise<any> {
    const meeting = await this.meetingRepository.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    // Verify access
    const isOrganizer = meeting.organizerId === userId;
    const participant = await this.meetingRepository.findParticipant(meetingId, userId);
    
    let hasAccess = isOrganizer || !!participant || role === Role.Admin;

    if (!hasAccess && meeting.projectId) {
      const projectMember = await prisma.projectMember.findFirst({
        where: { projectId: meeting.projectId, userId }
      });
      hasAccess = !!projectMember;
    }

    if (!hasAccess) {
      throw new AppError('Access denied. You are not invited to this meeting', 403);
    }

    // Set meeting status to LIVE if first person joins (or if organizer joins)
    if (meeting.status === MeetingStatus.SCHEDULED) {
      await this.meetingRepository.update(meetingId, { status: MeetingStatus.LIVE });
    }

    if (participant) {
      return this.meetingRepository.updateParticipant(meetingId, userId, {
        attendanceStatus: AttendanceStatus.ATTENDED,
        joinedAt: new Date()
      });
    } else {
      // Add as participant automatically if they are authorized project members
      return this.meetingRepository.addParticipant({
        meetingId,
        userId,
        role: ParticipantRole.PARTICIPANT,
        attendanceStatus: AttendanceStatus.ATTENDED,
        joinedAt: new Date()
      });
    }
  }

  async leaveMeeting(meetingId: string, userId: string): Promise<any> {
    const participant = await this.meetingRepository.findParticipant(meetingId, userId);
    if (!participant) {
      throw new AppError('Participant record not found', 404);
    }

    const leftAt = new Date();
    const joinedAt = participant.joinedAt || new Date();
    // In a real application, duration is calculated, we can track leftAt
    
    const updated = await this.meetingRepository.updateParticipant(meetingId, userId, {
      leftAt
    });

    // Check if all participants left. If organizer left, we might change status to completed.
    // To keep it simple, if organizer leaves and endTime has passed, or standard flow:
    const meeting = await this.meetingRepository.findById(meetingId);
    if (meeting && meeting.organizerId === userId) {
      await this.meetingRepository.update(meetingId, { status: MeetingStatus.COMPLETED });
    }

    return updated;
  }

  async listMeetings(userId: string, projectId?: string, status?: MeetingStatus): Promise<any[]> {
    return this.meetingRepository.listMeetings(userId, projectId, status);
  }
}
export default MeetingService;
