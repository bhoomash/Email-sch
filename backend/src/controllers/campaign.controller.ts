import { Request, Response, NextFunction } from 'express';
import { CampaignService } from '../services/campaign.service.js';
import { scheduleCampaignSchema } from '../validators/campaign.validator.js';

export class CampaignController {
  static async scheduleCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validated = scheduleCampaignSchema.parse(req.body);

      const result = await CampaignService.scheduleCampaign(userId, validated);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const campaigns = await CampaignService.getUserCampaigns(userId);

      return res.json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCampaignById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const campaignId = req.params.id;

      const campaign = await CampaignService.getCampaignById(userId, campaignId);

      return res.json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }
}
