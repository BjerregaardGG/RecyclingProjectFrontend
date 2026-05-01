export interface PickupRequest {
  id: number;
  itemId: number;
  itemName: string;
  itemImage: string;
  requesterId: number;
  requesterName: string;
  ownerId: number;
  ownerName: string;
  status: PickupStatus;
  createdAt: string;
  expiresAt: string;
  pickupAddress: string | null;
}

export type PickupStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "EXPIRED";
