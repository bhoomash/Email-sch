import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { SlackService } from '../services/slack.service.js';
import { WebClient } from '@slack/web-api';

export class SlackController {
  static getConnectUrl(req: Request, res: Response) {
    const clientId = env.SLACK_CLIENT_ID;
    const redirectUri = encodeURIComponent(env.SLACK_REDIRECT_URI);
    const scope = encodeURIComponent('chat:write,chat:write.public,channels:read');

    if (!clientId) {
      // Return developer mock connect trigger if credentials not configured
      return res.json({
        success: true,
        data: {
          url: `${env.FRONTEND_URL}/dashboard?slack_mock=true`,
          isMock: true,
        },
      });
    }

    const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;

    return res.json({
      success: true,
      data: { url: slackUrl, isMock: false },
    });
  }

  static async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;
      const userId = req.user?.id || (req.session as any)?.userId;

      if (!userId) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=Unauthorized`);
      }

      if (!code) {
        return res.redirect(`${env.FRONTEND_URL}/dashboard?error=MissingCode`);
      }

      const client = new WebClient();
      const oauthResult = await client.oauth.v2.access({
        client_id: env.SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri: env.SLACK_REDIRECT_URI,
      });

      if (!oauthResult.ok || !oauthResult.access_token || !oauthResult.team?.id) {
        return res.redirect(`${env.FRONTEND_URL}/dashboard?error=SlackOAuthFailed`);
      }

      await SlackService.saveSlackConnection(
        userId,
        oauthResult.access_token,
        oauthResult.team.id,
        oauthResult.team.name || 'Slack Workspace'
      );

      return res.redirect(`${env.FRONTEND_URL}/dashboard?slack=connected`);
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const connection = await SlackService.getSlackConnection(userId);

      return res.json({
        success: true,
        data: {
          isConnected: !!connection,
          teamName: connection?.teamName || null,
          teamId: connection?.teamId || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await SlackService.removeSlackConnection(userId);

      return res.json({
        success: true,
        message: 'Slack disconnected successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async mockConnect(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await SlackService.saveSlackConnection(userId, 'mock-slack-access-token', 'T1234567', 'Demo Slack Workspace');

      return res.json({
        success: true,
        data: {
          isConnected: true,
          teamName: 'Demo Slack Workspace',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
