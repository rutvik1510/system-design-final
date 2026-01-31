import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { PurchaseOrder, Trainer } from '../../../models/models';

@Component({
  selector: 'app-admin-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-purchase-orders.component.html',
  styleUrl: './admin-purchase-orders.component.css'
})
export class AdminPurchaseOrdersComponent implements OnInit {
  purchaseOrders = signal<PurchaseOrder[]>([]);
  trainers = signal<Trainer[]>([]);
  selectedPO = signal<PurchaseOrder | null>(null);
  selectedTrainerId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  showAssignModal = signal<boolean>(false);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    this.apiService.getAllPurchaseOrders().subscribe(orders => {
      this.purchaseOrders.set(orders);
      this.isLoading.set(false);
    });

    this.apiService.getAllTrainers().subscribe(trainers => {
      this.trainers.set(trainers);
    });
  }

  openAssignModal(po: PurchaseOrder): void {
    this.selectedPO.set(po);
    this.selectedTrainerId.set(null);
    this.showAssignModal.set(true);
  }

  closeModal(): void {
    this.showAssignModal.set(false);
    this.selectedPO.set(null);
    this.selectedTrainerId.set(null);
  }

  assignTrainer(): void {
    const po = this.selectedPO();
    const trainerId = this.selectedTrainerId();
    
    if (!po || !trainerId) return;

    const trainer = this.trainers().find(t => t.id === trainerId);
    if (!trainer) return;

    // Update PO status to Assigned
    this.apiService.updatePurchaseOrder(po.id, {
      status: 'Assigned',
      assignedTrainerId: trainer.id,
      assignedTrainerName: trainer.name
    }).subscribe(() => {
      // Create training request for trainer
      this.apiService.createTrainingRequest({
        purchaseOrderId: po.id,
        trainerId: trainer.id,
        trainerName: trainer.name,
        clientName: po.clientName,
        technology: po.technology,
        duration: po.duration,
        budget: po.budget,
        status: 'Sent',
        createdAt: new Date().toISOString()
      }).subscribe(() => {
        this.loadData();
        this.closeModal();
        alert('Trainer assigned and training request sent successfully!');
      });
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Assigned': return 'bg-info';
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
