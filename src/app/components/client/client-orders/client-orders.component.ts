import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { PurchaseOrder } from '../../../models/models';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-orders.component.html',
  styleUrl: './client-orders.component.css'
})
export class ClientOrdersComponent implements OnInit {
  purchaseOrders = signal<PurchaseOrder[]>([]);
  isLoading = signal<boolean>(false);
  selectedPO = signal<PurchaseOrder | null>(null);
  showDetailsModal = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.apiService.getPurchaseOrdersByClient(userId).subscribe(orders => {
      this.purchaseOrders.set(orders.reverse());
      this.isLoading.set(false);
    });
  }

  viewDetails(po: PurchaseOrder): void {
    this.selectedPO.set(po);
    this.showDetailsModal.set(true);
  }

  closeModal(): void {
    this.showDetailsModal.set(false);
    this.selectedPO.set(null);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Assigned': return 'bg-info';
      case 'Accepted': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusDescription(status: string): string {
    switch (status) {
      case 'Pending': return 'Your order is being reviewed by admin';
      case 'Assigned': return 'A trainer has been assigned and is reviewing your request';
      case 'Accepted': return 'Training request accepted! Check trainer details below';
      case 'Rejected': return 'Training request was rejected';
      default: return '';
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
