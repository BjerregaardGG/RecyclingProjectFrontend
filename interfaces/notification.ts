export interface Notification {
  id: number;
  userId: number;
  otherUserId: number;
  type: string;
  message: string;
  relatedId: number | null;
  isRead: boolean;
  createdAt: string;
}
