import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(configService: ConfigService) {
    const host = configService.get<string>('mail.host');
    const user = configService.get<string>('mail.user');
    this.from = configService.getOrThrow<string>('mail.from');

    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: configService.getOrThrow<number>('mail.port'),
          secure: configService.get<boolean>('mail.secure'),
          auth: user ? { user, pass: configService.get<string>('mail.password') } : undefined,
        })
      : null;

    if (!this.transporter) {
      this.logger.warn('SMTP_HOST is not set: emails will not be sent');
    }
  }

  /** Returns true if the email was handed to the SMTP server. */
  async sendPasswordReset(to: string, name: string, resetLink: string): Promise<boolean> {
    return this.send(
      to,
      'Restablecer tu contraseña de FitFlow',
      [
        `Hola ${name},`,
        '',
        'Recibimos un pedido para restablecer tu contraseña de FitFlow.',
        `Para elegir una nueva, abrí este enlace (vence en 1 hora):`,
        resetLink,
        '',
        'Si no fuiste vos, ignorá este correo: tu contraseña no cambia.',
      ].join('\n'),
      `<p>Hola ${this.escapeHtml(name)},</p>
       <p>Recibimos un pedido para restablecer tu contraseña de FitFlow.</p>
       <p><a href="${this.escapeHtml(resetLink)}">Elegir una nueva contraseña</a> (el enlace vence en 1 hora).</p>
       <p>Si no fuiste vos, ignorá este correo: tu contraseña no cambia.</p>`
    );
  }

  private async send(to: string, subject: string, text: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email "${subject}" to ${to} not sent: SMTP is not configured`);
      return false;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text, html });
      this.logger.log(`Email "${subject}" sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email "${subject}" to ${to}: ${String(error)}`);
      return false;
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
