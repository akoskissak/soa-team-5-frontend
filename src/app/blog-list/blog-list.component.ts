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

  currentUserId: string = '00000000-0000-0000-0000-000000000001';
  currentUsername: string = 'janci';

  constructor(private blogService: BlogService, private router: Router) {}

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts(): void {
    this.loading = true;
    this.error = null;
    this.blogService.getPosts().subscribe({
      next: (data: Post[]) => {
        this.posts = data.map((post) => ({
          ...post,
          isLikedByUser: false,
          CommentsCount: post.CommentsCount || 0,
          showComments: false,
          comments: [],
          newCommentText: '',
        }));
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

  goToCreateBlog(): void {
    this.router.navigate(['/create-blog']);
  }

  toggleLike(postId: string | undefined): void {
    if (postId === undefined) {
      console.error('Cannot toggle like: Post ID is undefined.');
      return;
    }
    const post = this.posts.find((p) => p.ID === postId);
    if (!post) {
      console.error('Post not found for ID:', postId);
      return;
    }

    this.blogService.toggleLike(postId, this.currentUserId).subscribe({
      next: () => {
        post.isLikedByUser = !post.isLikedByUser;
        if (post.isLikedByUser) {
          post.LikesCount = (post.LikesCount || 0) + 1;
        } else {
          post.LikesCount = Math.max(0, (post.LikesCount || 0) - 1);
        }
        console.log(
          `Lajk/Unlajk uspešno za post ${postId}. Novi broj lajkova: ${post.LikesCount}`
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
    const post = this.posts.find((p) => p.ID === postId);
    if (!post) {
      console.error('Post not found for ID:', postId);
      return;
    }

    post.showComments = !post.showComments;

    if (post.showComments && (!post.comments || post.comments.length === 0)) {
      this.blogService.getCommentsForPost(postId).subscribe({
        next: (comments: Comment[]) => {
          post.comments = comments;
          console.log(`Komentari za post ${postId} učitani.`, comments);
        },
        error: (err) => {
          console.error('Greška pri dohvatanju komentara:', err);
        },
      });
    }
  }

  addComment(post: Post): void {
    // <-- Sad prima CEO post objekat
    if (post.ID === undefined) {
      console.error('Cannot add comment: Post ID is undefined.');
      return;
    }

    const commentText = post.newCommentText || ''; 
    if (!commentText.trim()) {
      alert('Komentar ne može biti prazan!');
      return;
    }


    if (!this.currentUserId || !this.currentUsername) {
      alert('Niste prijavljeni. Molimo prijavite se da biste komentarisali.');
      return;
    }

    this.blogService
      .addComment(
        post.ID,
        commentText,
        this.currentUserId,
        this.currentUsername
      )
      .subscribe({
        next: (newComment: Comment) => {
          if (!post.comments) {
            post.comments = [];
          }
          post.comments.push(newComment);
          post.CommentsCount = (post.CommentsCount || 0) + 1;
          post.newCommentText = ''; // <-- RESETUJ TEKST SAMO ZA TAJ POST
          console.log('Komentar uspešno dodat:', newComment);
        },
        error: (err) => {
          console.error('Greška pri dodavanju komentara:', err);
        },
      });
  }
}
