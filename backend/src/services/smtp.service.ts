import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger.js';

export interface SendMailOptions {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  from: string;
  to: string;
  subject: string;
  body: string;
}

export interface SendMailResult {
  messageId: string;
  previewUrl?: string | false;
}

export class SmtpService {
  private static transporterCache = new Map<string, Transporter>();

  private static getTransporter(host: string, port: number, user: string, pass: string): Transporter {
    const key = `${host}:${port}:${user}`;
    if (this.transporterCache.has(key)) {
      return this.transporterCache.get(key)!;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
    });

    this.transporterCache.set(key, transporter);
    return transporter;
  }

  static async sendEmail(options: SendMailOptions): Promise<SendMailResult> {
    const transporter = this.getTransporter(
      options.smtpHost,
      options.smtpPort,
      options.smtpUser,
      options.smtpPassword
    );

    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.body,
      html: options.body.replace(/\n/g, '<br/>'),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info({ to: options.to, previewUrl }, 'Ethereal email sent — Preview URL available');
    }

    return {
      messageId: info.messageId,
      previewUrl,
    };
  }

  static async createEtherealAccount() {
    const testAccount = await nodemailer.createTestAccount();
    return {
      smtpHost: testAccount.smtp.host,
      smtpPort: testAccount.smtp.port,
      smtpUser: testAccount.user,
      smtpPassword: testAccount.pass,
      email: testAccount.user,
    };
  }
}
