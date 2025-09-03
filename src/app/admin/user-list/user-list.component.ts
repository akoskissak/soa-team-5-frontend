import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/user.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-list.component',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  users: User[] = [];

  constructor(private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
     this.userService.getAllUsers().subscribe((data) => {
      this.users = data;
      console.log(this.users);
      
    });
  }

  toggleBlock(user: User) {
    console.log(user)
    this.userService.toggleBlock(user).subscribe((updatedUser: User) => {
      const index = this.users.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        this.users[index].isBlocked = updatedUser.isBlocked;
      }
      console.log(updatedUser);  
      this.cdr.detectChanges();
    })
  }
}
