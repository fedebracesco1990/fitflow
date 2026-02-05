import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { DevicePlatform } from './entities/device-token.entity';
import { NotificationType } from './entities/notification-template.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    registerToken: jest.fn(),
    unregisterToken: jest.fn(),
    sendNotification: jest.fn(),
    getTemplates: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerToken', () => {
    it('should register a device token for user', async () => {
      const userId = 'user-123';
      const dto = { token: 'fcm-token', platform: DevicePlatform.WEB };
      const expectedResult = { id: '1', userId, ...dto };

      mockNotificationsService.registerToken.mockResolvedValue(expectedResult);

      const result = await controller.registerToken(userId, dto);

      expect(result).toEqual(expectedResult);
      expect(mockNotificationsService.registerToken).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('unregisterToken', () => {
    it('should unregister a device token', async () => {
      const userId = 'user-123';
      const token = 'fcm-token';

      mockNotificationsService.unregisterToken.mockResolvedValue(undefined);

      const result = await controller.unregisterToken(userId, token);

      expect(result).toEqual({ message: 'Token unregistered successfully' });
      expect(mockNotificationsService.unregisterToken).toHaveBeenCalledWith(userId, token);
    });
  });

  describe('sendNotification', () => {
    it('should send notification with template', async () => {
      const senderId = 'admin-123';
      const dto = {
        userId: 'user-123',
        templateType: NotificationType.MEMBERSHIP_EXPIRING,
      };
      const expectedResult = { success: true, sent: 1 };

      mockNotificationsService.sendNotification.mockResolvedValue(expectedResult);

      const result = await controller.sendNotification(dto);

      expect(result).toEqual(expectedResult);
      expect(mockNotificationsService.sendNotification).toHaveBeenCalledWith(dto, senderId);
    });

    it('should send custom notification', async () => {
      const senderId = 'admin-123';
      const dto = {
        userId: 'user-123',
        title: 'Test Title',
        body: 'Test Body',
      };
      const expectedResult = { success: true, sent: 1 };

      mockNotificationsService.sendNotification.mockResolvedValue(expectedResult);

      const result = await controller.sendNotification(dto);

      expect(result).toEqual(expectedResult);
      expect(mockNotificationsService.sendNotification).toHaveBeenCalledWith(dto, senderId);
    });
  });

  describe('getTemplates', () => {
    it('should return all notification templates', async () => {
      const templates = [
        {
          id: '1',
          type: NotificationType.MEMBERSHIP_EXPIRING,
          title: 'Expiring',
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

      mockNotificationsService.getTemplates.mockResolvedValue(templates);

      const result = await controller.getTemplates();

      expect(result).toEqual(templates);
      expect(mockNotificationsService.getTemplates).toHaveBeenCalled();
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const dto = {
        type: NotificationType.CUSTOM,
        title: 'New Template',
        body: 'New Body',
        isActive: true,
      };
      const expectedResult = { id: '1', ...dto };

      mockNotificationsService.createTemplate.mockResolvedValue(expectedResult);

      const result = await controller.createTemplate(dto);

      expect(result).toEqual(expectedResult);
      expect(mockNotificationsService.createTemplate).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateTemplate', () => {
    it('should update an existing template', async () => {
      const id = '1';
      const dto = { title: 'Updated Title' };
      const expectedResult = {
        id,
        type: NotificationType.CUSTOM,
        title: 'Updated Title',
        body: 'Body',
        isActive: true,
      };

      mockNotificationsService.updateTemplate.mockResolvedValue(expectedResult);

      const result = await controller.updateTemplate(id, dto);

      expect(result).toEqual(expectedResult);
      expect(mockNotificationsService.updateTemplate).toHaveBeenCalledWith(id, dto);
    });
  });
});
