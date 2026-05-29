export interface Review {
  id: number;
  reviewerId: number;
  reviewerName: string;
  reviewerImage: string | null;
  reviewedId: number;
  rating: number;
  createdAt: string;
}
