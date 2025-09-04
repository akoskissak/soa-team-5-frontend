import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isGuide = false;
  isAdmin = false;
  isLoggedIn = false;
  isTourist = false;
  private sub?: Subscription;

  constructor(public authService: AuthService, private router: Router) {}
  protected readonly title = signal('tourist-app');

  ngOnInit() {
    this.sub = this.authService.role$.subscribe((role) => {
      this.isAdmin = role === 'admin';
      this.isGuide = role === 'guide';
      this.isTourist = role === 'tourist';
      this.isLoggedIn = !!role;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
