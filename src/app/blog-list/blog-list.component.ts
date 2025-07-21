import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../services/blog';
import { Post } from '../shared/models/post.model'; 
import { CommonModule } from '@angular/common'; 
import { MarkdownModule} from 'ngx-markdown';


@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownModule], 
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  posts: Post[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private blogService: BlogService, private router: Router) { }

  ngOnInit(): void {
    this.getPosts(); 
    
  }

  getPosts(): void {
    this.loading = true;
    this.error = null; 
    this.blogService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
        console.log(data);
      },
      error: (err) => {
        console.error('Greška pri dohvatanju postova:', err);
        this.error = 'Greška pri dohvatanju postova. Molimo pokušajte ponovo.';
        this.loading = false;
      }
    });
  }

  goToCreateBlog(): void {
    this.router.navigate(['/create-blog']); 
  }
}