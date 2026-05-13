export interface Item {
  id: number;
  name: string;
  description: string;
  secondDescription: string;
  image: string;
  category: string;
  userId: number;
  latitude: number;
  longitude: number;
  status: string;
  reservedAt: string | null;
}
