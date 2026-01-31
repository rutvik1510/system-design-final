import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { PurchaseOrder } from '../../../models/models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  totalPOs = signal<number>(0);
  pendingPOs = signal<number>(0);
  acceptedPOs = signal<number>(0);
  recentPOs = signal<PurchaseOrder[]>([]);

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

    this.apiService.getPurchaseOrdersByClient(userId).subscribe(orders => {
      this.totalPOs.set(orders.length);
      this.pendingPOs.set(orders.filter(o => o.status === 'Pending' || o.status === 'Assigned').length);
      this.acceptedPOs.set(orders.filter(o => o.status === 'Accepted').length);
      this.recentPOs.set(orders.slice(-5).reverse());
    });
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
}
