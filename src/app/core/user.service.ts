import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../shared/models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private stakeholdersApi = 'http://localhost:8080/api';
  private api = 'http://localhost:8080/api/admin/users'; // primer
  private profileApi = this.stakeholdersApi + '/user/profile';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.api);
  }
}
