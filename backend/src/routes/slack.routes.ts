import { Router } from 'express';
import { SlackController } from '../controllers/slack.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/connect', requireAuth, SlackController.getConnectUrl);
router.get('/callback', SlackController.handleCallback);
router.get('/status', requireAuth, SlackController.getStatus);
router.delete('/disconnect', requireAuth, SlackController.disconnect);
router.post('/mock-connect', requireAuth, SlackController.mockConnect);

export default router;
