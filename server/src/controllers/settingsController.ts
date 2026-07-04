import { Request, Response, NextFunction } from 'express';
import { PreferenceService } from '../services/preferenceService';
import { ProfileService } from '../services/profileService';
import { PasswordService } from '../services/passwordService';
import { SessionService } from '../services/sessionService';
import { DeviceService } from '../services/deviceService';
import { AppError } from '../utils/AppError';
import { validationResult } from 'express-validator';

const preferenceService = new PreferenceService();
const profileService = new ProfileService();
const passwordService = new PasswordService();
const sessionService = new SessionService();
const deviceService = new DeviceService();

const checkValidation = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }
};

// Preferences
export const getPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    // Track active session dynamically upon query
    await sessionService.trackSession(userId, req);
    const preferences = await preferenceService.getPreferences(userId);
    res.status(200).json({ status: 'success', data: { preferences } });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const userId = req.user!.id;
    const preferences = await preferenceService.updatePreferences(userId, req.body);
    res.status(200).json({ status: 'success', data: { preferences } });
  } catch (error) {
    next(error);
  }
};

// Profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const userId = req.user!.id;
    const user = await profileService.updateProfile(userId, req.body);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

// Password
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    checkValidation(req);
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    await passwordService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Sessions
export const getSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    // Make sure current session is refreshed
    await sessionService.trackSession(userId, req);
    const sessions = await sessionService.getSessions(userId);
    res.status(200).json({ status: 'success', data: { sessions } });
  } catch (error) {
    next(error);
  }
};

export const revokeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await sessionService.revokeSession(userId, id);
    res.status(200).json({ status: 'success', message: 'Session revoked successfully' });
  } catch (error) {
    next(error);
  }
};

export const revokeOtherSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { activeSessionId } = req.body;
    if (!activeSessionId) {
      return next(new AppError('Active Session ID is required', 400));
    }
    await sessionService.revokeOtherSessions(userId, activeSessionId);
    res.status(200).json({ status: 'success', message: 'All other sessions successfully revoked' });
  } catch (error) {
    next(error);
  }
};

// Devices
export const getDevices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const devices = await deviceService.getDevices(userId);
    res.status(200).json({ status: 'success', data: { devices } });
  } catch (error) {
    next(error);
  }
};

export const trustDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { deviceName, fingerprint } = req.body;
    if (!deviceName || !fingerprint) {
      return next(new AppError('Device Name and Fingerprint are required', 400));
    }
    const device = await deviceService.trustDevice(userId, deviceName, fingerprint);
    res.status(201).json({ status: 'success', data: { device } });
  } catch (error) {
    next(error);
  }
};

export const renameDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { deviceName } = req.body;
    if (!deviceName) {
      return next(new AppError('New Device Name is required', 400));
    }
    const device = await deviceService.renameDevice(userId, id, deviceName);
    res.status(200).json({ status: 'success', data: { device } });
  } catch (error) {
    next(error);
  }
};

export const removeDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await deviceService.removeDevice(userId, id);
    res.status(200).json({ status: 'success', message: 'Trusted device removed' });
  } catch (error) {
    next(error);
  }
};
