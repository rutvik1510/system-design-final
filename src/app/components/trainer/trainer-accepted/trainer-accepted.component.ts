import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { TrainingRequest, Invoice, Trainer } from '../../../models/models';

@Component({
  selector: 'app-trainer-accepted',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-accepted.component.html',
  styleUrl: './trainer-accepted.component.css'
})
export class TrainerAcceptedComponent implements OnInit {
  acceptedRequests = signal<TrainingRequest[]>([]);
  trainerInvoices = signal<Invoice[]>([]);
  currentTrainer = signal<Trainer | null>(null);
  isLoading = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    // Load trainer profile
    this.apiService.getTrainerByUserId(userId).subscribe(trainer => {
      this.currentTrainer.set(trainer);
      
      if (trainer) {
        // Load invoices for this trainer
        this.apiService.getInvoicesByTrainer(trainer.id).subscribe(invoices => {
          this.trainerInvoices.set(invoices);
        });
      }
    });

    // Use the new method that finds trainer by userId first
    this.apiService.getTrainingRequestsForLoggedInTrainer(userId).subscribe(requests => {
      // Filter only accepted requests
      this.acceptedRequests.set(requests.filter(r => r.status === 'Accepted' || r.status === 'Completed'));
      this.isLoading.set(false);
    });
  }

  markAsCompleted(request: TrainingRequest): void {
    if (confirm('Are you sure you want to mark this training as completed?')) {
      this.apiService.updateTrainingRequest(request.id, {
        status: 'Completed',
        completedAt: new Date().toISOString()
      }).subscribe(() => {
        // Update PO status
        this.apiService.updatePurchaseOrder(request.purchaseOrderId, {
          status: 'Completed'
        }).subscribe(() => {
          this.loadData();
          alert('Training marked as completed!');
        });
      });
    }
  }

  sendInvoice(request: TrainingRequest): void {
    const trainer = this.currentTrainer();
    if (!trainer) {
      alert('Trainer profile not found!');
      return;
    }

    // Check if invoice already exists
    const existingInvoice = this.trainerInvoices().find(
      inv => inv.trainingRequestId === request.id && inv.type === 'trainer-to-admin'
    );

    if (existingInvoice) {
      alert('Invoice already sent for this training!');
      return;
    }

    const invoice: Partial<Invoice> = {
      type: 'trainer-to-admin',
      purchaseOrderId: request.purchaseOrderId,
      trainingRequestId: request.id,
      trainerId: trainer.id,
      trainerName: trainer.name,
      technology: request.technology,
      duration: request.duration,
      trainingAmount: request.budget,
      totalAmount: request.budget,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    this.apiService.createInvoice(invoice).subscribe(() => {
      // Update PO status
      this.apiService.updatePurchaseOrder(request.purchaseOrderId, {
        status: 'Invoiced'
      }).subscribe(() => {
        this.loadData();
        alert('Invoice sent to admin successfully!');
      });
    });
  }

  hasInvoice(requestId: number): boolean {
    return this.trainerInvoices().some(
      inv => inv.trainingRequestId === requestId && inv.type === 'trainer-to-admin'
    );
  }

  getInvoiceStatus(requestId: number): string {
    const invoice = this.trainerInvoices().find(
      inv => inv.trainingRequestId === requestId && inv.type === 'trainer-to-admin'
    );
    return invoice ? invoice.status : '';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
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
