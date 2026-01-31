import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { PurchaseOrder, TrainingRequest } from '../../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  totalPOs = signal<number>(0);
  pendingPOs = signal<number>(0);
  acceptedTrainings = signal<number>(0);
  sentRequests = signal<number>(0);
  
  recentPOs = signal<PurchaseOrder[]>([]);
  recentRequests = signal<TrainingRequest[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load Purchase Orders stats
    this.apiService.getAllPurchaseOrders().subscribe(orders => {
      this.totalPOs.set(orders.length);
      this.pendingPOs.set(orders.filter(o => o.status === 'Pending').length);
      this.acceptedTrainings.set(orders.filter(o => o.status === 'Accepted').length);
      this.recentPOs.set(orders.slice(-5).reverse());
    });

    // Load Training Requests stats
    this.apiService.getAllTrainingRequests().subscribe(requests => {
      this.sentRequests.set(requests.filter(r => r.status === 'Sent').length);
      this.recentRequests.set(requests.slice(-5).reverse());
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
}
