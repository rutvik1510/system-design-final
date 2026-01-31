import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { TrainingRequest } from '../../../models/models';

@Component({
  selector: 'app-trainer-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-requests.component.html',
  styleUrl: './trainer-requests.component.css'
})
export class TrainerRequestsComponent implements OnInit {
  trainingRequests = signal<TrainingRequest[]>([]);
  isLoading = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    // Use the new method that finds trainer by userId first
    this.apiService.getTrainingRequestsForLoggedInTrainer(userId).subscribe(requests => {
      // Filter only pending (Sent) requests
      this.trainingRequests.set(requests.filter(r => r.status === 'Sent'));
      this.isLoading.set(false);
    });
  }

  acceptRequest(request: TrainingRequest): void {
    if (confirm(`Are you sure you want to accept this training request for ${request.technology}?`)) {
      // Update training request status
      this.apiService.updateTrainingRequest(request.id, { status: 'Accepted' }).subscribe(() => {
        // Update the purchase order status
        this.apiService.updatePurchaseOrder(request.purchaseOrderId, { status: 'Accepted' }).subscribe(() => {
          this.loadRequests();
          alert('Training request accepted successfully!');
        });
      });
    }
  }

  rejectRequest(request: TrainingRequest): void {
    if (confirm(`Are you sure you want to reject this training request for ${request.technology}?`)) {
      // Update training request status
      this.apiService.updateTrainingRequest(request.id, { status: 'Rejected' }).subscribe(() => {
        // Update the purchase order status
        this.apiService.updatePurchaseOrder(request.purchaseOrderId, { status: 'Rejected' }).subscribe(() => {
          this.loadRequests();
          alert('Training request rejected.');
        });
      });
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
