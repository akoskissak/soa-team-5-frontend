import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../shared/models/user.model';
import { map, Observable, tap } from 'rxjs';

interface UserResponse {
  users: User[];
}
@Injectable({ providedIn: 'root' })
export class UserService {
  private stakeholdersApi = 'http://localhost:8080/api';
  private api = 'http://localhost:8080/api/admin/users'; // primer
  private profileApi = this.stakeholdersApi + '/user/profile';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
  return this.http.get<UserResponse>(this.api).pipe(
    tap(response => console.log('Raw API Response:', response)),
    map(response => response.users),
    tap(users => console.log('Mapped Users Array:', users))
  );
}

  toggleBlock(user: User): Observable<User> {
    console.log(user)
    return this.http.put<User>(this.stakeholdersApi + '/admin/block-user', {
      userId: user.id,
      block: !user.isBlocked
    })
  }
}
