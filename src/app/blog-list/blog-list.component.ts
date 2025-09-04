import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../services/blog';
import { Post } from '../shared/models/post.model';
import { Comment } from '../shared/models/comment.model';
import { Like } from '../shared/models/like.model';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MarkdownModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
})
export class BlogListComponent implements OnInit {
  posts: Post[] = [];
  loading: boolean = true;
  error: string | null = null;

  currentUserId: string | null = '';
  currentUsername: string | null = '';

  private backendBaseUrl = 'http://localhost:8086';

  constructor(private blogService: BlogService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.getPosts();
    this.currentUserId = this.authService.getUserId();
    this.currentUsername = this.authService.getUsername();

  }

  getPosts(): void {
    this.loading = true;
    this.error = null;
    this.blogService.getPosts().subscribe({
      next: (response: any) => {
        // Pristupite "posts" polju unutar primljenog objekta
        const receivedPosts = response.posts;

        // Proverite da li je "posts" polje niz i obradite ga
        if (Array.isArray(receivedPosts)) {
          this.posts = receivedPosts.map((post) => ({
            ...post,
            isLikedByUser: false,
            commentsCount: post.commentsCount || 0,
            showComments: false,
            comments: [],
            newCommentText: '',
          }));
        } else {
          console.error('API nije vratio ispravan format podataka (očekivan je niz postova).');
          this.posts = [];
        }

        this.loading = false;
        console.log(this.posts);
      },
      error: (err) => {
        console.error('Greška pri dohvatanju postova:', err);
        this.error = 'Greška pri dohvatanju postova. Molimo pokušajte ponovo.';
        this.loading = false;
      },
    });
  }

  getAbsoluteImageUrl(relativePath: string | null | undefined): string {
  if (!relativePath) {
    return 'https://via.placeholder.com/150';
  }
  if (
    relativePath.startsWith('http://') ||
    relativePath.startsWith('https://') ||
    relativePath.startsWith('data:image/')
  ) {
    return relativePath;
  }

  if (relativePath.startsWith('/uploads/')) {

    return `${this.backendBaseUrl}${relativePath}`;
  }

  return `${this.backendBaseUrl}/uploads/${relativePath}`;
}

  goToCreateBlog(): void {
    this.router.navigate(['/create-blog']);
  }

  toggleLike(postId: string | undefined): void {
    if (postId === undefined) {
      console.error('Cannot toggle like: Post ID is undefined.');
      return;
    }
    const post = this.posts.find((p) => p.id === postId);
    if (!post) {
      console.error('Post not found for ID:', postId);
      return;
    }

     if (!this.currentUserId) {
      console.error('Morate biti prijavljeni da biste lajkovali post.');
      return; // Izlazi iz funkcije ako korisnik nije ulogovan
      }

    this.blogService.toggleLike(postId, this.currentUserId).subscribe({
      next: () => {
        post.isLikedByUser = !post.isLikedByUser;
        if (post.isLikedByUser) {
          post.likesCount = (post.likesCount || 0) + 1;
        } else {
          post.likesCount = Math.max(0, (post.likesCount || 0) - 1);
        }
        console.log(
          `Lajk/Unlajk uspešno za post ${postId}. Novi broj lajkova: ${post.likesCount}`
        );
      },
      error: (err) => {
        console.error('Greška pri lajkovanju/unlajkovanju posta:', err);
      },
    });
  }

   openComments(postId: string | undefined): void {
    if (postId === undefined) {
      console.error('Cannot open comments: Post ID is undefined.');
      return;
    }
    const post = this.posts.find((p) => p.id === postId);
    if (!post) {
      console.error('Post not found for ID:', postId);
      return;
    }

    post.showComments = !post.showComments;

    if (post.showComments && (!post.comments || post.comments.length === 0)) {
      this.blogService.getCommentsForPost(postId).subscribe({
        next: (response: any) => { 
          const comments = response.comments; 
          console.log(comments) 
          if (Array.isArray(comments)) {
            post.comments = comments;
          } else {
            post.comments = [];
            console.error('Primljeni komentari nisu niz.');
          }
          console.log(`Komentari za post ${postId} učitani.`, post.comments);
        },
        error: (err) => {
          console.error('Greška pri dohvatanju komentara:', err);
        },
      });
    }
  }


  addComment(post: Post): void {
    console.log(this.currentUserId);
    if (post.id === undefined) {
      console.error('Cannot add comment: Post ID is undefined.');
      return;
    }

    const commentText = post.newCommentText || '';
    if (!commentText.trim()) {
      // NAPOMENA: Uklonjena je "alert" funkcija. Koristite modal za poruke.
      console.warn('Komentar ne može biti prazan!');
      return;
    }

    if (!this.currentUserId || !this.currentUsername) {
      // NAPOMENA: Uklonjena je "alert" funkcija. Koristite modal za poruke.
      console.warn('Niste prijavljeni. Molimo prijavite se da biste komentarisali.');
      return;
    }

    this.blogService
      .addComment(
        post.id,
        commentText,
        this.currentUserId,
        this.currentUsername
      )
      .subscribe({
        next: (newComment: Comment) => {
          // Provera da li je comments niz pre dodavanja
          if (!Array.isArray(post.comments)) {
            post.comments = [];
          }
          post.comments.push(newComment);
          post.commentsCount = (post.commentsCount || 0) + 1;
          post.newCommentText = '';
          console.log('Komentar uspešno dodat:', newComment);
        },
        error: (err) => {
          console.error('Greška pri dodavanju komentara:', err);
        },
      });
  }
}
