import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  
  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in (from sessionStorage)
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
    }
  }

  login(username: string, password: string, role: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}/users?username=${username}&password=${password}&role=${role}`)
      .pipe(
        map(users => users.length > 0 ? users[0] : null),
        tap(user => {
          if (user) {
            this.currentUser.set(user);
            this.isLoggedIn.set(true);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
          }
        })
      );
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    sessionStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }

  getRole(): string | null {
    return this.currentUser()?.role || null;
  }

  getUserId(): number | null {
    return this.currentUser()?.id || null;
  }

  getUserName(): string | null {
    return this.currentUser()?.name || null;
  }
}
