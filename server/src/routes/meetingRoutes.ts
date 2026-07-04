import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createMeeting,
  listMeetings,
  getMeetingDetails,
  updateMeeting,
  cancelMeeting,
  deleteMeeting,
  duplicateMeeting,
  inviteMembers,
  respondInvitation,
  joinMeeting,
  leaveMeeting
} from '../controllers/meetingController';
import {
  createMeetingValidator,
  updateMeetingValidator,
  meetingIdParamValidator,
  inviteMembersValidator,
  respondInvitationValidator
} from '../validators/meetingValidator';

const router = Router();

// Protect all meeting management routes
router.use(protect);

router.post('/', createMeetingValidator, createMeeting);
router.get('/', listMeetings);
router.get('/calendar', listMeetings);

router.get('/:id', meetingIdParamValidator, getMeetingDetails);
router.put('/:id', meetingIdParamValidator, updateMeetingValidator, updateMeeting);
router.delete('/:id', meetingIdParamValidator, deleteMeeting);

router.patch('/:id/cancel', meetingIdParamValidator, cancelMeeting);
router.post('/:id/invite', meetingIdParamValidator, inviteMembersValidator, inviteMembers);
router.patch('/:id/respond', meetingIdParamValidator, respondInvitationValidator, respondInvitation);
router.post('/:id/duplicate', meetingIdParamValidator, duplicateMeeting);

router.patch('/:id/join', meetingIdParamValidator, joinMeeting);
router.patch('/:id/leave', meetingIdParamValidator, leaveMeeting);

export default router;
