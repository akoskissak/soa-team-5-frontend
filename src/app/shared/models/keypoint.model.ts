export interface Keypoint {
  id?: string;
  tourId?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: File | null;
  imagePath?: string;
  completed?: boolean;
}
