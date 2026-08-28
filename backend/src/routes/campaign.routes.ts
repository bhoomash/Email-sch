import { Router } from 'express';
import { CampaignController } from '../controllers/campaign.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/schedule', CampaignController.scheduleCampaign);
router.get('/', CampaignController.getCampaigns);
router.get('/:id', CampaignController.getCampaignById);

export default router;
