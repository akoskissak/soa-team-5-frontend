
export interface ReviewImage {
  id: string;
  imagePath: string;
  reviewId: string;
}

export interface Review {
  id: string;
  tourId: string;
  touristId: string;
  username: string;
  rating: number;
  comment: string;
  submissionDate: string;
  visitedDate: string;
  ReviewImages: ReviewImage[]; 
}