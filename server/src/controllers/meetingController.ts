import { Request, Response, NextFunction } from 'express';
import { MeetingService } from '../services/meetingService';
import { Role, MeetingStatus } from '@prisma/client';

const meetingService = new MeetingService();

export const createMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user!.id;
    const role = req.user!.role as Role;
    
    const meeting = await meetingService.createMeeting(req.body, organizerId, role);
    
    res.status(201).json({
      status: 'success',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const getMeetingDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    
    const meeting = await meetingService.getMeetingDetails(req.params.id, userId, role);
    
    res.status(200).json({
      status: 'success',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const updateMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    
    const meeting = await meetingService.updateMeeting(req.params.id, req.body, userId, role);
    
    res.status(200).json({
      status: 'success',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    
    const meeting = await meetingService.cancelMeeting(req.params.id, userId, role);
    
    res.status(200).json({
      status: 'success',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    
    await meetingService.deleteMeeting(req.params.id, userId, role);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const duplicateMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    
    const meeting = await meetingService.duplicateMeeting(req.params.id, userId, role);
    
    res.status(201).json({
      status: 'success',
      data: { meeting }
    });
  } catch (error) {
    next(error);
  }
};

export const inviteMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    const { invitedUserIds } = req.body;
    
    await meetingService.inviteMembers(req.params.id, invitedUserIds, userId, role);
    
    res.status(200).json({
      status: 'success',
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const respondInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { response } = req.body;
    
    const participant = await meetingService.respondInvitation(req.params.id, userId, response);
    
    res.status(200).json({
      status: 'success',
      data: { participant }
    });
  } catch (error) {
    next(error);
  }
};

export const joinMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role as Role;
    
    const participant = await meetingService.joinMeeting(req.params.id, userId, role);
    
    res.status(200).json({
      status: 'success',
      data: { participant }
    });
  } catch (error) {
    next(error);
  }
};

export const leaveMeeting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    
    const participant = await meetingService.leaveMeeting(req.params.id, userId);
    
    res.status(200).json({
      status: 'success',
      data: { participant }
    });
  } catch (error) {
    next(error);
  }
};

export const listMeetings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { projectId, status } = req.query;
    
    const meetings = await meetingService.listMeetings(
      userId,
      projectId ? String(projectId) : undefined,
      status ? (String(status) as MeetingStatus) : undefined
    );
    
    res.status(200).json({
      status: 'success',
      data: { meetings }
    });
  } catch (error) {
    next(error);
  }
};
export default {
  createMeeting,
  getMeetingDetails,
  updateMeeting,
  cancelMeeting,
  deleteMeeting,
  duplicateMeeting,
  inviteMembers,
  respondInvitation,
  joinMeeting,
  leaveMeeting,
  listMeetings
};
