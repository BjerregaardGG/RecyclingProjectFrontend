export interface Conversation {
  pickupId: number;
  otherUserId: number;
  otherUserName: string;
  otherUserImage: string;
  itemName: string;
  itemImage: string;
  lastMessageContent: string;
  lastMessageAt: string;
  unreadCount: number;
}
