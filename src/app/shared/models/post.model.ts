import { Comment } from './comment.model'; 

export interface Post {
  ID?: string; 
  UserID?: string; 
  Username?: string; 
  Title: string; 
  Description: string; 
  CreatedAt?: Date; 
  imageURLs?: string[]; 
  LikesCount?: number; 

  isLikedByUser?: boolean; 
  CommentsCount?: number;  
  showComments?: boolean;  
  comments?: Comment[];
  newCommentText?: string; 
}