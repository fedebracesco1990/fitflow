import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { DeviceToken, NotificationTemplate, NotificationType } from './entities';
import { RegisterTokenDto, SendNotificationDto, CreateTemplateDto, UpdateTemplateDto } from './dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseInitialized = false;

  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    @InjectRepository(NotificationTemplate)
    private readonly templateRepository: Repository<NotificationTemplate>,
    private readonly configService: ConfigService
  ) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not configured. Push notifications will be disabled.');
      return;
    }

    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.firebaseInitialized = true;
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  async registerToken(userId: string, dto: RegisterTokenDto): Promise<DeviceToken> {
    const existing = await this.deviceTokenRepository.findOne({
      where: { userId, token: dto.token },
    });

    if (existing) {
      return existing;
    }

    const deviceToken = this.deviceTokenRepository.create({
      userId,
      token: dto.token,
      platform: dto.platform,
    });

    return this.deviceTokenRepository.save(deviceToken);
  }

  async unregisterToken(userId: string, token: string): Promise<void> {
    await this.deviceTokenRepository.delete({ userId, token });
  }

  async getUserTokens(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepository.find({ where: { userId } });
  }

  async sendToUser(
    userId: string,
    title: string,
    body: string
  ): Promise<{ success: boolean; sent: number }> {
    if (!this.firebaseInitialized) {
      this.logger.warn('Firebase not initialized. Notification not sent.');
      return { success: false, sent: 0 };
    }

    const tokens = await this.deviceTokenRepository.find({ where: { userId } });

    if (tokens.length === 0) {
      this.logger.log(`No device tokens found for user ${userId}`);
      return { success: true, sent: 0 };
    }

    const tokenStrings = tokens.map((t) => t.token);
    let sent = 0;

    for (const token of tokenStrings) {
      try {
        await admin.messaging().send({
          token,
          notification: { title, body },
          data: {
            title,
            body,
            type: 'direct',
            timestamp: Date.now().toString(),
          },
        });
        sent++;
      } catch (error: unknown) {
        const firebaseError = error as { code?: string };
        this.logger.error(`Failed to send notification to token: ${token}`, error);
        if (
          firebaseError.code === 'messaging/invalid-registration-token' ||
          firebaseError.code === 'messaging/registration-token-not-registered'
        ) {
          await this.deviceTokenRepository.delete({ token });
          this.logger.log(`Removed invalid token: ${token}`);
        }
      }
    }

    return { success: true, sent };
  }

  async sendByTemplate(
    userId: string,
    templateType: NotificationType
  ): Promise<{ success: boolean; sent: number }> {
    const template = await this.templateRepository.findOne({
      where: { type: templateType, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateType} not found or inactive`);
    }

    return this.sendToUser(userId, template.title, template.body);
  }

  async sendToAll(
    title: string,
    body: string,
    excludeUserId?: string
  ): Promise<{ success: boolean; sent: number }> {
    if (!this.firebaseInitialized) {
      this.logger.warn('Firebase not initialized. Broadcast notification not sent.');
      return { success: false, sent: 0 };
    }

    let allTokens = await this.deviceTokenRepository.find();

    if (excludeUserId) {
      allTokens = allTokens.filter((t) => t.userId !== excludeUserId);
      this.logger.log(`Excluded sender (${excludeUserId}) from broadcast`);
    }

    if (allTokens.length === 0) {
      this.logger.log('No device tokens found for broadcast');
      return { success: true, sent: 0 };
    }

    this.logger.log(`Starting broadcast notification to ${allTokens.length} devices`);
    let sent = 0;

    for (const deviceToken of allTokens) {
      try {
        await admin.messaging().send({
          token: deviceToken.token,
          notification: { title, body },
          data: {
            title,
            body,
            type: 'broadcast',
            timestamp: Date.now().toString(),
          },
        });
        sent++;
      } catch (error: unknown) {
        const firebaseError = error as { code?: string };
        this.logger.error(`Failed to send broadcast to token: ${deviceToken.token}`, error);
        if (
          firebaseError.code === 'messaging/invalid-registration-token' ||
          firebaseError.code === 'messaging/registration-token-not-registered'
        ) {
          await this.deviceTokenRepository.delete({ token: deviceToken.token });
          this.logger.log(`Removed invalid token: ${deviceToken.token}`);
        }
      }
    }

    this.logger.log(`Broadcast notification sent to ${sent}/${allTokens.length} devices`);
    return { success: true, sent };
  }

  async sendNotification(
    dto: SendNotificationDto,
    senderId?: string
  ): Promise<{ success: boolean; sent: number }> {
    if (dto.broadcast && dto.title && dto.body) {
      return this.sendToAll(dto.title, dto.body, senderId);
    }

    if (dto.templateType && dto.userId) {
      return this.sendByTemplate(dto.userId, dto.templateType);
    }

    if (dto.title && dto.body && dto.userId) {
      return this.sendToUser(dto.userId, dto.title, dto.body);
    }

    throw new BadRequestException(
      'Provide either (broadcast + title + body), (userId + templateType), or (userId + title + body)'
    );
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({ order: { type: 'ASC' } });
  }

  async getTemplateByType(type: NotificationType): Promise<NotificationTemplate | null> {
    return this.templateRepository.findOne({ where: { type } });
  }

  async createTemplate(dto: CreateTemplateDto): Promise<NotificationTemplate> {
    const existing = await this.templateRepository.findOne({ where: { type: dto.type } });
    if (existing) {
      throw new BadRequestException(`Template ${dto.type} already exists`);
    }

    const template = this.templateRepository.create(dto);
    return this.templateRepository.save(template);
  }

  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`Template ${id} not found`);
    }

    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }
}
