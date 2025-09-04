// src/app/services/blog.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Post } from '../shared/models/post.model';
import { Comment } from '../shared/models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://localhost:8080/posts'; 
  private api = 'http://localhost:8086'; 

  constructor(private http: HttpClient) { }

 
   createPost(post: Post): Observable<Post> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const postToSend = {
      userId: post.userId,
      username: post.username,
      title: post.title,
      description: post.description,
      imageUrls: post.imageUrls
    };

    return this.http.post<Post>(this.apiUrl, postToSend, { headers });
  }


  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file, file.name); 

    return this.http.post<{ imageUrl: string }>(`${this.api}/upload-image`, formData)
      .pipe(
        map(response => response.imageUrl) 
      );
  }

  toggleLike(postId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${postId}/like`, { userId: userId }); 
  }

  getCommentsForPost(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}/comments`);
  }

  addComment(postId: string, text: string, userId: string, username: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${postId}/comments`, { text, userId, username });
  }
  
}