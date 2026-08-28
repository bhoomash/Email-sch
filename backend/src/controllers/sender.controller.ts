import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { SmtpService } from '../services/smtp.service.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { z } from 'zod';

const createSenderSchema = z.object({
  email: z.string().email('Invalid email'),
  smtpHost: z.string().min(1),
  smtpPort: z.number().int().default(587),
  smtpUser: z.string().min(1),
  smtpPassword: z.string().min(1),
});

export class SenderController {
  static async getSenders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const senders = await prisma.sender.findMany({
        where: { userId },
        select: {
          id: true,
          email: true,
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          createdAt: true,
          updatedAt: true,
          // smtpPassword omitted for security
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        data: senders,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSender(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const validated = createSenderSchema.parse(req.body);

      const sender = await prisma.sender.create({
        data: {
          userId,
          ...validated,
        },
        select: {
          id: true,
          email: true,
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: sender,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createEtherealSender(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const account = await SmtpService.createEtherealAccount();

      const sender = await prisma.sender.create({
        data: {
          userId,
          email: account.email,
          smtpHost: account.smtpHost,
          smtpPort: account.smtpPort,
          smtpUser: account.smtpUser,
          smtpPassword: account.smtpPassword,
        },
        select: {
          id: true,
          email: true,
          smtpHost: true,
          smtpPort: true,
          smtpUser: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        data: sender,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSender(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const senderId = req.params.id;

      const sender = await prisma.sender.findUnique({
        where: { id: senderId },
      });

      if (!sender) {
        throw new NotFoundError('Sender not found');
      }

      if (sender.userId !== userId) {
        throw new ForbiddenError('Access denied');
      }

      await prisma.sender.delete({
        where: { id: senderId },
      });

      return res.json({
        success: true,
        message: 'Sender deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
