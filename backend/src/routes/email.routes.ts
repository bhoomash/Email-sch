import { Router } from 'express';
import { EmailController } from '../controllers/email.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/scheduled', EmailController.getScheduledEmails);
router.get('/sent', EmailController.getSentEmails);
router.get('/search', EmailController.searchEmails);
router.post('/parse-csv', EmailController.parseCsv);
router.get('/:id', EmailController.getEmailById);

export default router;
