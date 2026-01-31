import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Invoice } from '../../../models/models';

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-invoices.component.html',
  styleUrl: './client-invoices.component.css'
})
export class ClientInvoicesComponent implements OnInit {
  invoices = signal<Invoice[]>([]);
  isLoading = signal<boolean>(false);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading.set(true);
    const clientId = this.authService.getUserId();
    
    if (!clientId) {
      this.isLoading.set(false);
      return;
    }

    this.apiService.getInvoicesByClient(clientId).subscribe(invoices => {
      this.invoices.set(invoices);
      this.isLoading.set(false);
    });
  }

  getTotalPending(): number {
    return this.invoices()
      .filter(i => i.status === 'Pending')
      .reduce((sum, i) => sum + i.totalAmount, 0);
  }

  getTotalPaid(): number {
    return this.invoices()
      .filter(i => i.status === 'Paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Approved': return 'bg-success';
      case 'Paid': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}
