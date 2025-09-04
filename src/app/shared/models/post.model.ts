import { Comment } from './comment.model'; 

export interface Post {
  id?: string; 
  userId?: string; 
  username?: string; 
  title: string; 
  description: string; 
  createdAt?: Date; 
  imageUrls?: string[]; 
  likesCount?: number; 

  isLikedByUser?: boolean; 
  commentsCount?: number;  
  showComments?: boolean;  
  comments?: Comment[];
  newCommentText?: string; 
}