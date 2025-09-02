import { Keypoint } from "./keypoint.model";

export interface Tour {
  id?: string;
  userId?: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  status?: 'Draft' | 'Published';
  price?: number;

  keypoints?: Keypoint[];
}
