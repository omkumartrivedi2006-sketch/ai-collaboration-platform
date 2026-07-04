import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import * as settingsController from '../controllers/settingsController';
import * as settingsValidator from '../validators/settingsValidator';

const router = Router();

// Protect all settings subroutes
router.use(protect);

// Preferences
router.get('/preferences', settingsController.getPreferences);
router.put('/preferences', settingsValidator.validateUpdatePreferences, settingsController.updatePreferences);

// Profile Settings
router.put('/profile', settingsValidator.validateUpdateProfile, settingsController.updateProfile);

// Password Change
router.put('/password', settingsValidator.validateChangePassword, settingsController.changePassword);

// Sessions
router.get('/sessions', settingsController.getSessions);
router.delete('/sessions/other', settingsController.revokeOtherSessions);
router.delete('/sessions/:id', settingsController.revokeSession);

// Trusted Devices
router.get('/devices', settingsController.getDevices);
router.post('/devices', settingsController.trustDevice);
router.put('/devices/:id', settingsController.renameDevice);
router.delete('/devices/:id', settingsController.removeDevice);

export default router;
