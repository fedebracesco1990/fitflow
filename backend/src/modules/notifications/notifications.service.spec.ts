import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { DeviceToken, DevicePlatform } from './entities/device-token.entity';
import { NotificationTemplate, NotificationType } from './entities/notification-template.entity';
import { AppNotification } from './entities/notification.entity';
import { NotificationRead } from './entities/notification-read.entity';
import { RealtimeService } from '../websocket/realtime.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockDeviceTokenRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue({ affected: 0 }),
  };

  const mockTemplateRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockNotificationReadRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(null),
  };

  const mockRealtimeService = {
    notifyNewNotification: jest.fn(),
    broadcast: jest.fn(),
    broadcastExcept: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(DeviceToken),
          useValue: mockDeviceTokenRepository,
        },
        {
          provide: getRepositoryToken(NotificationTemplate),
          useValue: mockTemplateRepository,
        },
        {
          provide: getRepositoryToken(AppNotification),
          useValue: mockNotificationRepository,
        },
        {
          provide: getRepositoryToken(NotificationRead),
          useValue: mockNotificationReadRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RealtimeService,
          useValue: mockRealtimeService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerToken', () => {
    const userId = 'user-123';
    const dto = { token: 'fcm-token-123', platform: DevicePlatform.WEB };

    it('should delete existing tokens and create a new one', async () => {
      const newToken = { id: '1', userId, ...dto };
      mockDeviceTokenRepository.create.mockReturnValue(newToken);
      mockDeviceTokenRepository.save.mockResolvedValue(newToken);

      const result = await service.registerToken(userId, dto);

      expect(mockDeviceTokenRepository.delete).toHaveBeenCalledWith({ token: dto.token });
      expect(mockDeviceTokenRepository.create).toHaveBeenCalledWith({
        userId,
        token: dto.token,
        platform: dto.platform,
      });
      expect(mockDeviceTokenRepository.save).toHaveBeenCalledWith(newToken);
      expect(result).toEqual(newToken);
    });
  });

  describe('unregisterToken', () => {
    it('should delete token for user', async () => {
      const userId = 'user-123';
      const token = 'fcm-token-123';

      await service.unregisterToken(userId, token);

      expect(mockDeviceTokenRepository.delete).toHaveBeenCalledWith({
        userId,
        token,
      });
    });
  });

  describe('getUserTokens', () => {
    it('should return all tokens for user', async () => {
      const userId = 'user-123';
      const tokens = [
        { id: '1', userId, token: 'token-1', platform: DevicePlatform.WEB },
        { id: '2', userId, token: 'token-2', platform: DevicePlatform.ANDROID },
      ];
      mockDeviceTokenRepository.find.mockResolvedValue(tokens);

      const result = await service.getUserTokens(userId);

      expect(result).toEqual(tokens);
      expect(mockDeviceTokenRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('sendToUser', () => {
    const mockNotification = { id: 'notif-1', createdAt: new Date() };

    beforeEach(() => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
    });

    it('should persist notification and emit via WebSocket', async () => {
      const result = await service.sendToUser('user-123', 'Title', 'Body');

      expect(mockNotificationRepository.create).toHaveBeenCalled();
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(mockRealtimeService.notifyNewNotification).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          notificationId: 'notif-1',
          title: 'Title',
          body: 'Body',
        })
      );
      expect(result).toEqual({ success: true, sent: 0, notificationId: 'notif-1' });
    });

    it('should return sent 0 when Firebase not initialized (FCM skipped)', async () => {
      const result = await service.sendToUser('user-123', 'Title', 'Body');

      expect(result.sent).toBe(0);
      expect(result.success).toBe(true);
    });
  });

  describe('sendByTemplate', () => {
    it('should throw NotFoundException when template not found', async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.sendByTemplate('user-123', NotificationType.MEMBERSHIP_EXPIRING)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when template is inactive', async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.sendByTemplate('user-123', NotificationType.MEMBERSHIP_EXPIRED)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendNotification', () => {
    it('should throw BadRequestException when no valid params provided', async () => {
      await expect(service.sendNotification({})).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when only title provided', async () => {
      await expect(service.sendNotification({ title: 'Test' })).rejects.toThrow(
        BadRequestException
      );
    });

    it('should pass senderUserId to sendToAll for broadcast', async () => {
      const mockNotification = { id: 'notif-1', createdAt: new Date() };
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      await service.sendNotification({ broadcast: true, title: 'Hi', body: 'World' }, 'admin-1');

      expect(mockRealtimeService.broadcastExcept).toHaveBeenCalledWith(
        'admin-1',
        'notification.new',
        expect.objectContaining({ title: 'Hi' })
      );
    });
  });

  describe('getTemplates', () => {
    it('should return all templates ordered by type', async () => {
      const templates = [
        {
          id: '1',
          type: NotificationType.CUSTOM,
          title: 'Custom',
          body: 'Body',
          isActive: true,
        },
        {
          id: '2',
          type: NotificationType.LOW_ATTENDANCE,
          title: 'Low',
          body: 'Body',
          isActive: true,
        },
      ];
      mockTemplateRepository.find.mockResolvedValue(templates);

      const result = await service.getTemplates();

      expect(result).toEqual(templates);
      expect(mockTemplateRepository.find).toHaveBeenCalledWith({
        order: { type: 'ASC' },
      });
    });
  });

  describe('createTemplate', () => {
    const dto = {
      type: NotificationType.CUSTOM,
      title: 'Test',
      body: 'Body',
      isActive: true,
    };

    it('should throw BadRequestException when template type already exists', async () => {
      mockTemplateRepository.findOne.mockResolvedValue({ id: '1', ...dto });

      await expect(service.createTemplate(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create new template when type does not exist', async () => {
      const newTemplate = { id: '1', ...dto };
      mockTemplateRepository.findOne.mockResolvedValue(null);
      mockTemplateRepository.create.mockReturnValue(newTemplate);
      mockTemplateRepository.save.mockResolvedValue(newTemplate);

      const result = await service.createTemplate(dto);

      expect(result).toEqual(newTemplate);
    });
  });

  describe('updateTemplate', () => {
    it('should throw NotFoundException when template not found', async () => {
      mockTemplateRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateTemplate('non-existent-id', { title: 'New Title' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should update template when found', async () => {
      const existingTemplate = {
        id: '1',
        type: NotificationType.CUSTOM,
        title: 'Old',
        body: 'Body',
        isActive: true,
      };
      const updatedTemplate = { ...existingTemplate, title: 'New Title' };

      mockTemplateRepository.findOne.mockResolvedValue(existingTemplate);
      mockTemplateRepository.save.mockResolvedValue(updatedTemplate);

      const result = await service.updateTemplate('1', { title: 'New Title' });

      expect(result.title).toBe('New Title');
    });
  });
});
