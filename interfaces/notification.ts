export interface Notification {
  id: number;
  type: string;
  message: string;
  pickupId: number | null;
  read: boolean;
  createdAt: string;
}
