import { Router } from 'express';
import { SenderController } from '../controllers/sender.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', SenderController.getSenders);
router.post('/', SenderController.createSender);
router.post('/ethereal', SenderController.createEtherealSender);
router.delete('/:id', SenderController.deleteSender);

export default router;
