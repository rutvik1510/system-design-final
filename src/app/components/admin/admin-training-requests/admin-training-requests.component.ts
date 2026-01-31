import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { TrainingRequest } from '../../../models/models';

@Component({
  selector: 'app-admin-training-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-training-requests.component.html',
  styleUrl: './admin-training-requests.component.css'
})
export class AdminTrainingRequestsComponent implements OnInit {
  trainingRequests = signal<TrainingRequest[]>([]);
  isLoading = signal<boolean>(false);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.apiService.getAllTrainingRequests().subscribe(requests => {
      this.trainingRequests.set(requests);
      this.isLoading.set(false);
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
