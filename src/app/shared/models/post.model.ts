export interface Post {
  ID?: string; 
  UserID?: string; 
  Username?: string; 
  Title: string; 
  Description: string; 
  CreatedAt?: Date; 
  imageURLs?: string[]; 
  LikesCount?: number; 
}