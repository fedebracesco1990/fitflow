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
import {
  DeviceToken,
  NotificationTemplate,
  NotificationType,
  AppNotification,
  NotificationTargetType,
  NotificationRead,
} from './entities';
import { RegisterTokenDto, SendNotificationDto, CreateTemplateDto, UpdateTemplateDto } from './dto';
import { RealtimeService } from '../websocket/realtime.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseInitialized = false;

  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    @InjectRepository(NotificationTemplate)
    private readonly templateRepository: Repository<NotificationTemplate>,
    @InjectRepository(AppNotification)
    private readonly notificationRepository: Repository<AppNotification>,
    @InjectRepository(NotificationRead)
    private readonly notificationReadRepository: Repository<NotificationRead>,
    private readonly configService: ConfigService,
    private readonly realtimeService: RealtimeService
  ) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private buildMessagePayload(
    token: string,
    title: string,
    body: string,
    type: 'direct' | 'broadcast'
  ): admin.messaging.Message {
    return {
      token,
      notification: { title, body },
      data: {
        title,
        body,
        type,
        timestamp: Date.now().toString(),
      },
    };
  }

  private async handleInvalidToken(token: string, error: unknown): Promise<void> {
    const firebaseError = error as { code?: string };
    if (
      firebaseError.code === 'messaging/invalid-registration-token' ||
      firebaseError.code === 'messaging/registration-token-not-registered'
    ) {
      await this.deviceTokenRepository.delete({ token });
      this.logger.log(`Removed invalid token: ${token}`);
    }
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
    // IMPORTANT: First, remove this token from ALL users (handles device switching between accounts)
    const deletedFromOthers = await this.deviceTokenRepository.delete({ token: dto.token });
    if (deletedFromOthers.affected && deletedFromOthers.affected > 0) {
      this.logger.log(
        `Removed token from ${deletedFromOthers.affected} other user(s) before registering`
      );
    }

    const deviceToken = this.deviceTokenRepository.create({
      userId,
      token: dto.token,
      platform: dto.platform,
    });

    this.logger.log(`Registered ${dto.platform} token for user ${userId}`);
    return this.deviceTokenRepository.save(deviceToken);
  }

  async unregisterToken(userId: string, token: string): Promise<void> {
    await this.deviceTokenRepository.delete({ userId, token });
  }

  async getUserTokens(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepository.find({ where: { userId } });
  }

  async debugTokens(): Promise<{
    totalTokens: number;
    uniqueUsers: number;
    tokens: Array<{ userId: string; platform: string; createdAt: Date }>;
  }> {
    const allTokens = await this.deviceTokenRepository.find();
    const uniqueUsers = new Set(allTokens.map((t) => t.userId)).size;
    return {
      totalTokens: allTokens.length,
      uniqueUsers,
      tokens: allTokens.map((t) => ({
        userId: t.userId,
        platform: t.platform,
        createdAt: t.createdAt,
      })),
    };
  }

  async cleanupDuplicateTokens(): Promise<{ deleted: number; remaining: number }> {
    const allTokens = await this.deviceTokenRepository.find({ order: { createdAt: 'DESC' } });
    const seenUserPlatform = new Set<string>();
    const tokensToDelete: string[] = [];

    for (const token of allTokens) {
      const key = `${token.userId}-${token.platform}`;
      if (seenUserPlatform.has(key)) {
        tokensToDelete.push(token.id);
      } else {
        seenUserPlatform.add(key);
      }
    }

    if (tokensToDelete.length > 0) {
      await this.deviceTokenRepository.delete(tokensToDelete);
      this.logger.log(`Cleaned up ${tokensToDelete.length} duplicate tokens`);
    }

    return { deleted: tokensToDelete.length, remaining: allTokens.length - tokensToDelete.length };
  }

  async sendToUser(
    userId: string,
    title: string,
    body: string,
    type?: string,
    senderUserId?: string
  ): Promise<{ success: boolean; sent: number; notificationId: string }> {
    // Always persist the notification server-side
    const notification = await this.persistNotification({
      title,
      body,
      type,
      targetType: NotificationTargetType.USER,
      targetUserId: userId,
      senderUserId: senderUserId ?? null,
    });

    // Always emit via WebSocket for in-app delivery
    this.realtimeService.notifyNewNotification(userId, {
      notificationId: notification.id,
      title,
      body,
      type,
      timestamp: notification.createdAt,
    });

    // FCM push is optional - only send if Firebase is initialized
    let sent = 0;
    if (this.firebaseInitialized) {
      const tokens = await this.deviceTokenRepository.find({ where: { userId } });
      for (const deviceToken of tokens) {
        try {
          const message = this.buildMessagePayload(deviceToken.token, title, body, 'direct');
          await admin.messaging().send(message);
          sent++;
        } catch (error: unknown) {
          this.logger.error(`Failed to send FCM to token: ${deviceToken.token}`, error);
          await this.handleInvalidToken(deviceToken.token, error);
        }
      }
    }

    return { success: true, sent, notificationId: notification.id };
  }

  async sendByTemplate(
    userId: string,
    templateType: NotificationType,
    senderUserId?: string
  ): Promise<{ success: boolean; sent: number }> {
    const template = await this.templateRepository.findOne({
      where: { type: templateType, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(`Template ${templateType} not found or inactive`);
    }

    return this.sendToUser(userId, template.title, template.body, undefined, senderUserId);
  }

  async sendToAll(
    title: string,
    body: string,
    senderUserId?: string
  ): Promise<{ success: boolean; sent: number; notificationId: string }> {
    // Persist one broadcast notification (targetUserId = null)
    const notification = await this.persistNotification({
      title,
      body,
      targetType: NotificationTargetType.BROADCAST,
      targetUserId: null,
      senderUserId: senderUserId ?? null,
    });

    // Broadcast via WebSocket for in-app delivery (exclude sender)
    const wsPayload = {
      notificationId: notification.id,
      title,
      body,
      type: 'broadcast',
      timestamp: notification.createdAt,
    };
    if (senderUserId) {
      this.realtimeService.broadcastExcept(senderUserId, 'notification.new', wsPayload);
    } else {
      this.realtimeService.broadcast('notification.new', wsPayload);
    }

    // FCM push is optional
    let sent = 0;
    if (this.firebaseInitialized) {
      let allTokens = await this.deviceTokenRepository.find();

      if (senderUserId) {
        allTokens = allTokens.filter((t) => t.userId !== senderUserId);
      }

      for (const deviceToken of allTokens) {
        try {
          const message = this.buildMessagePayload(deviceToken.token, title, body, 'broadcast');
          await admin.messaging().send(message);
          sent++;
        } catch (error: unknown) {
          this.logger.error(`Failed to send broadcast to token: ${deviceToken.token}`, error);
          await this.handleInvalidToken(deviceToken.token, error);
        }
      }

      this.logger.log(`Broadcast FCM sent to ${sent}/${allTokens.length} tokens`);
    }

    return { success: true, sent, notificationId: notification.id };
  }

  async sendNotification(
    dto: SendNotificationDto,
    senderUserId?: string
  ): Promise<{ success: boolean; sent: number }> {
    if (dto.broadcast && dto.title && dto.body) {
      return this.sendToAll(dto.title, dto.body, senderUserId);
    }

    if (dto.templateType && dto.userId) {
      return this.sendByTemplate(dto.userId, dto.templateType, senderUserId);
    }

    if (dto.title && dto.body && dto.userId) {
      return this.sendToUser(dto.userId, dto.title, dto.body, undefined, senderUserId);
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

  // ─── In-App Notification Methods ───────────────────────────────────

  private async persistNotification(params: {
    title: string;
    body: string;
    type?: string;
    targetType: NotificationTargetType;
    targetUserId: string | null;
    senderUserId: string | null;
    data?: Record<string, unknown>;
  }): Promise<AppNotification> {
    const notification = this.notificationRepository.create({
      title: params.title,
      body: params.body,
      type: params.type ?? null,
      targetType: params.targetType,
      targetUserId: params.targetUserId,
      senderUserId: params.senderUserId,
      data: params.data ?? null,
    });
    const saved = await this.notificationRepository.save(notification);
    this.logger.debug(`Persisted notification ${saved.id} (${params.targetType})`);
    return saved;
  }

  async getUserNotifications(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<{ notifications: Array<AppNotification & { read: boolean }>; total: number }> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('n')
      .leftJoin(NotificationRead, 'nr', 'nr.notificationId = n.id AND nr.userId = :userId', {
        userId,
      })
      .addSelect('CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END', 'isRead')
      .where('n.targetUserId = :userId OR n.targetType = :broadcast', {
        userId,
        broadcast: NotificationTargetType.BROADCAST,
      })
      .andWhere('(n.senderUserId != :userId OR n.senderUserId IS NULL)')
      .orderBy('n.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    const total = await queryBuilder.getCount();
    const rawResults = await queryBuilder.getRawAndEntities();

    const notifications = rawResults.entities.map((entity, index) => {
      const raw = rawResults.raw[index] as Record<string, unknown>;
      return {
        ...entity,
        read: Number(raw?.isRead) === 1,
      };
    });

    return { notifications, total };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    const existing = await this.notificationReadRepository.findOne({
      where: { notificationId, userId },
    });
    if (!existing) {
      const read = this.notificationReadRepository.create({ notificationId, userId });
      await this.notificationReadRepository.save(read);
    }
  }

  async markAllAsRead(userId: string): Promise<{ marked: number }> {
    // 1. Get all notification IDs visible to this user
    const visibleNotifications = await this.notificationRepository
      .createQueryBuilder('n')
      .select('n.id')
      .where('n.targetUserId = :userId OR n.targetType = :broadcast', {
        userId,
        broadcast: NotificationTargetType.BROADCAST,
      })
      .andWhere('(n.senderUserId != :userId OR n.senderUserId IS NULL)')
      .getRawMany();

    if (visibleNotifications.length === 0) {
      return { marked: 0 };
    }

    const visibleIds: string[] = visibleNotifications.map((r: { n_id: string }) => r.n_id);

    // 2. Get already-read notification IDs for this user
    const existingReads = await this.notificationReadRepository.find({
      where: { userId },
      select: ['notificationId'],
    });
    const alreadyReadIds = new Set(existingReads.map((r) => r.notificationId));

    // 3. Create read records only for unread ones
    const unreadIds = visibleIds.filter((id) => !alreadyReadIds.has(id));

    if (unreadIds.length === 0) {
      return { marked: 0 };
    }

    const reads = unreadIds.map((notificationId) =>
      this.notificationReadRepository.create({ notificationId, userId })
    );
    await this.notificationReadRepository.save(reads);

    return { marked: reads.length };
  }
}
