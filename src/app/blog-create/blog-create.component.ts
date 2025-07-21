import { Component, OnInit } from '@angular/core';
import { Post } from '../shared/models/post.model';
import { Router } from '@angular/router';
import { BlogService } from '../services/blog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-blog-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MarkdownModule],
  templateUrl: './blog-create.component.html',
  styleUrls: ['./blog-create.component.css']
})
export class BlogCreateComponent implements OnInit {

  newPost: Post = {
    Title: '',
    Description: '',
    imageURLs: []
  };

  titleError: string = '';
  descriptionError: string = '';

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  uploadingImages: boolean = false;

  constructor(
    private blogService: BlogService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    this.titleError = '';
    this.descriptionError = '';

    if (!this.newPost.Title.trim()) {
      this.titleError = 'Naslov je obavezan.';
      return;
    }
    if (!this.newPost.Description.trim()) {
      this.descriptionError = 'Opis je obavezan.';
      return;
    }

    this.uploadingImages = true;

    if (this.selectedFiles.length === 0) {
      this.createBlogPost();
      return;
    }

    const uploadObservables: Observable<string>[] = this.selectedFiles.map(file =>
      this.blogService.uploadImage(file).pipe(
        catchError(error => {
          console.error(`Greška pri uploadu slike ${file.name}:`, error);
          alert(`Greška pri uploadu slike ${file.name}. Post neće biti kreiran.`);
          this.uploadingImages = false;
          return of('');
        })
      )
    );

    forkJoin(uploadObservables).pipe(
      finalize(() => this.uploadingImages = false)
    ).subscribe({
      next: (imageUrls: string[]) => {
        this.newPost.imageURLs = imageUrls.filter(url => url !== '');
        if (this.newPost.imageURLs.length !== this.selectedFiles.length) {
            console.warn('Neke slike nisu uspešno uploadovane.');
        }
        this.createBlogPost();
      },
      error: (error) => {
        console.error('Došlo je do greške u uploadu svih slika:', error);
        alert('Došlo je do greške u uploadu slika. Post neće biti kreiran.');
      }
    });
  }

  private createBlogPost(): void {
    this.blogService.createPost(this.newPost).subscribe({
      next: (response: any) => {
        console.log('Blog uspešno kreiran:', response);
        alert('Blog uspešno kreiran!');
        this.router.navigate(['/blogs']);
        this.resetForm();
      },
      error: (error: { error: { error: any; }; message: any; }) => {
        console.error('Greška pri kreiranju bloga:', error);
        alert('Došlo je do greške pri kreiranju bloga: ' + (error.error.error || error.message));
      }
    });
  }

  private resetForm(): void {
      this.newPost = {
          UserID: '00000000-0000-0000-0000-000000000001',
          Username: 'djurdjevic_m',
          Title: '',
          Description: '',
          imageURLs: []
      };
      this.selectedFiles = [];
      this.imagePreviews = [];
      const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
  }

  goBackToBlogs(): void {
    this.router.navigate(['/blogs']);
  }
}