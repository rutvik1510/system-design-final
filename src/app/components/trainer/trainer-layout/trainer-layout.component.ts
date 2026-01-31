import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-trainer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './trainer-layout.component.html',
  styleUrl: './trainer-layout.component.css'
})
export class TrainerLayoutComponent implements OnInit {
  userName = signal<string>('Trainer');
  sidebarCollapsed = signal<boolean>(false);

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const name = this.authService.getUserName();
    if (name) {
      this.userName.set(name);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
