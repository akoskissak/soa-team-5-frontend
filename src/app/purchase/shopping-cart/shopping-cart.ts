import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../purchase.service';
import { Observable, EMPTY, catchError, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { ShoppingCart } from '../../shared/models/purchase.model';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-cart.html',
  styleUrls: ['./shopping-cart.css']
})
export class ShoppingCartComponent implements OnInit {
  shoppingCart$: Observable<ShoppingCart | null> = EMPTY;
  touristId: string | null = null;

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const touristId = this.authService.getUserId();

    if (touristId === null) {
      console.warn('User not logged in. Redirecting to login page.');
      this.router.navigate(['/login']);
    } else {
      this.touristId = touristId;
      this.purchaseService.getShoppingCart(this.touristId).subscribe({
        next: (cart) => {
          this.shoppingCart$ = new Observable(observer => observer.next(cart));
        },
        error: (err) => {
          console.error('Failed to load shopping cart:', err);
          if (err.status === 404) {
            this.purchaseService.createShoppingCart(this.touristId!).subscribe({
              next: (newCart) => {
                this.shoppingCart$ = new Observable(observer => observer.next(newCart));
                console.log('Shopping cart created successfully.');
              },
              error: (createErr) => {
                console.error('Failed to create shopping cart:', createErr);
                this.shoppingCart$ = new Observable(observer => observer.next(null));
              }
            });
          }
        }
      });
    }
  }

  removeItem(tourId: string): void {
    if (this.touristId) {
      this.purchaseService.removeItemFromCart(this.touristId, tourId).subscribe({
        next: () => {
          console.log('Item removed successfully');
          this.shoppingCart$ = this.purchaseService.getShoppingCart(this.touristId!);
        },
        error: (err) => {
          console.error('Failed to remove item:', err);
        }
      });
    }
  }

  checkout(): void {
    if (this.touristId) {
      this.purchaseService.checkout(this.touristId).subscribe({
        next: (tokens) => {
          console.log('Checkout successful! Tokens:', tokens);
          alert('Uspešno ste kupili ture!');
          this.router.navigate(['/purchased-tours']); 
        },
        error: (err) => {
          console.error('Checkout failed:', err);
        }
      });
    }
  }
}