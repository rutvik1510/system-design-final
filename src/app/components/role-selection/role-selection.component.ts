import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.css'
})
export class RoleSelectionComponent {
  selectedRole = signal<string | null>(null);
  username = signal<string>('');
  password = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  selectRole(role: string): void {
    this.selectedRole.set(role);
    this.errorMessage.set('');
    
    // Pre-fill credentials for demo (optional - can be removed)
    if (role === 'admin') {
      this.username.set('admin');
      this.password.set('admin123');
    } else if (role === 'trainer') {
      this.username.set('trainer');
      this.password.set('trainer123');
    } else if (role === 'client') {
      this.username.set('client');
      this.password.set('client123');
    }
  }

  login(): void {
    const role = this.selectedRole();
    const username = this.username();
    const password = this.password();

    if (!role || !username || !password) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(username, password, role).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (user) {
          // Navigate to respective dashboard
          switch (role) {
            case 'admin':
              this.router.navigate(['/admin']);
              break;
            case 'trainer':
              this.router.navigate(['/trainer']);
              break;
            case 'client':
              this.router.navigate(['/client']);
              break;
          }
        } else {
          this.errorMessage.set('Invalid credentials. Please try again.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Server error. Make sure JSON Server is running on port 3000.');
        console.error('Login error:', error);
      }
    });
  }

  goBack(): void {
    this.selectedRole.set(null);
    this.username.set('');
    this.password.set('');
    this.errorMessage.set('');
  }
}
