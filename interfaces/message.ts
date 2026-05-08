export interface Message {
  id: number;
  pickupRequestId: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string;
}
