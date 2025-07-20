import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../shared/models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private api = 'http://localhost:8080/api/admin/users'; // primer

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }

  toggleBlock(user: User): Observable<User> {
    return this.http.put<User>(this.stakeholdersApi + '/admin/block-user', {
      userId: user.id,
      block: !user.isBlocked
    })
  }
}
