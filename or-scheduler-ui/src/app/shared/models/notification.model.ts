export type NotificationType = 'INFO' | 'WARNING' | 'EMERGENCY' | 'REMINDER';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  surgeryId?: string;
  createdAt: string;
}
