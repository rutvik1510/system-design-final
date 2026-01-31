import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { TrainingRequest } from '../../../models/models';

@Component({
  selector: 'app-trainer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trainer-dashboard.component.html',
  styleUrl: './trainer-dashboard.component.css'
})
export class TrainerDashboardComponent implements OnInit {
  pendingRequests = signal<number>(0);
  acceptedRequests = signal<number>(0);
  rejectedRequests = signal<number>(0);
  recentRequests = signal<TrainingRequest[]>([]);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    // Use the new method that finds trainer by userId first
    this.apiService.getTrainingRequestsForLoggedInTrainer(userId).subscribe(requests => {
      this.pendingRequests.set(requests.filter(r => r.status === 'Sent').length);
      this.acceptedRequests.set(requests.filter(r => r.status === 'Accepted').length);
      this.rejectedRequests.set(requests.filter(r => r.status === 'Rejected').length);
      this.recentRequests.set(requests.slice(-5).reverse());
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Sent': return 'bg-primary';
      case 'Accepted': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
