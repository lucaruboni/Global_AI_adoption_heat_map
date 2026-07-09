import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Sends transactional email via SMTP. When SMTP isn't configured it degrades to
 * a logged no-op, so registration and downloads never fail for lack of email.
 */
export class EmailService {
  private transporter: Transporter | null = null;

  private get isConfigured(): boolean {
    return config.smtp.host !== null && config.smtp.user !== null;
  }

  private getTransporter(): Transporter | null {
    if (!this.isConfigured) return null;
    this.transporter ??= nodemailer.createTransport({
      host: config.smtp.host ?? undefined,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth:
        config.smtp.user && config.smtp.password
          ? { user: config.smtp.user, pass: config.smtp.password }
          : undefined,
    });
    return this.transporter;
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      logger.info('Email (no-op, SMTP not configured)', { to, subject });
      return;
    }
    try {
      await transporter.sendMail({ from: config.smtp.from, to, subject, html });
      logger.info('Email sent', { to, subject });
    } catch (err) {
      // Never let email failures break the request flow.
      logger.error('Email send failed', { to, subject, err: (err as Error).message });
    }
  }

  async sendWelcome(to: string): Promise<void> {
    await this.send(
      to,
      'Welcome to the Global AI Adoption Heat Map',
      `<h2>Thanks for joining!</h2>
       <p>You can now download the full historical AI-adoption dataset (CSV, JSON, or Parquet).</p>
       <p>We'll email you when new data lands. — The Global AI Adoption Heat Map</p>`
    );
  }

  async sendDatasetReady(to: string, format: string): Promise<void> {
    await this.send(
      to,
      'Your dataset download is ready',
      `<p>Your <strong>${format.toUpperCase()}</strong> download has started. Thanks for supporting the project!</p>`
    );
  }
}

export const emailService = new EmailService();
