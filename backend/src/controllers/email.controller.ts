import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../services/email.service.js';
import { emailQuerySchema, emailSearchSchema } from '../validators/email.validator.js';
import { parseCsvEmails } from '../utils/csv.parser.js';

export class EmailController {
  static async getScheduledEmails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = emailQuerySchema.parse(req.query);

      const result = await EmailService.getScheduledEmails(userId, { page, limit });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSentEmails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page, limit } = emailQuerySchema.parse(req.query);

      const result = await EmailService.getSentEmails(userId, { page, limit });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchEmails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { q } = emailSearchSchema.parse(req.query);

      const items = await EmailService.searchEmails(userId, q);

      return res.json({
        success: true,
        data: {
          items,
          total: items.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEmailById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const emailId = req.params.id;

      const email = await EmailService.getEmailById(userId, emailId);

      return res.json({
        success: true,
        data: email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async parseCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csvContent = req.body?.csvText || ((req as any).file ? (req as any).file.buffer.toString('utf-8') : '');
      if (!csvContent) {
        return res.status(400).json({
          success: false,
          message: 'No CSV content or file provided',
        });
      }

      const result = parseCsvEmails(csvContent);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
