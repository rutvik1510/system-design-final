import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Invoice, PurchaseOrder } from '../../../models/models';

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-invoices.component.html',
  styleUrl: './admin-invoices.component.css'
})
export class AdminInvoicesComponent implements OnInit {
  trainerInvoices = signal<Invoice[]>([]);
  clientInvoices = signal<Invoice[]>([]);
  purchaseOrders = signal<PurchaseOrder[]>([]);
  isLoading = signal<boolean>(false);
  
  // Modal state
  showCommissionModal = signal<boolean>(false);
  selectedInvoice = signal<Invoice | null>(null);
  commissionPercent = signal<number>(10);

  // Computed signals for filtered invoices
  pendingTrainerInvoices = computed(() => 
    this.trainerInvoices().filter(i => i.status === 'Pending')
  );
  
  approvedTrainerInvoices = computed(() => 
    this.trainerInvoices().filter(i => i.status === 'Approved' || i.status === 'Paid')
  );

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Load trainer invoices
    this.apiService.getInvoicesByType('trainer-to-admin').subscribe(invoices => {
      this.trainerInvoices.set(invoices);
    });

    // Load client invoices
    this.apiService.getInvoicesByType('admin-to-client').subscribe(invoices => {
      this.clientInvoices.set(invoices);
    });

    // Load purchase orders
    this.apiService.getAllPurchaseOrders().subscribe(orders => {
      this.purchaseOrders.set(orders);
      this.isLoading.set(false);
    });
  }

  getPurchaseOrder(poId: number): PurchaseOrder | undefined {
    return this.purchaseOrders().find(po => po.id === poId || po.id.toString() === poId.toString());
  }

  openCommissionModal(invoice: Invoice): void {
    this.selectedInvoice.set(invoice);
    this.commissionPercent.set(10);
    this.showCommissionModal.set(true);
  }

  closeModal(): void {
    this.showCommissionModal.set(false);
    this.selectedInvoice.set(null);
  }

  calculateCommission(): number {
    const invoice = this.selectedInvoice();
    if (!invoice) return 0;
    return (invoice.trainingAmount * this.commissionPercent()) / 100;
  }

  calculateTotal(): number {
    const invoice = this.selectedInvoice();
    if (!invoice) return 0;
    return invoice.trainingAmount + this.calculateCommission();
  }

  approveAndSendToClient(): void {
    const invoice = this.selectedInvoice();
    if (!invoice) return;

    const po = this.getPurchaseOrder(invoice.purchaseOrderId);
    if (!po) {
      alert('Purchase order not found!');
      return;
    }

    // Update trainer invoice status
    this.apiService.updateInvoice(invoice.id, {
      status: 'Approved',
      approvedAt: new Date().toISOString()
    }).subscribe(() => {
      // Create client invoice
      const clientInvoice: Partial<Invoice> = {
        type: 'admin-to-client',
        purchaseOrderId: invoice.purchaseOrderId,
        trainingRequestId: invoice.trainingRequestId,
        trainerId: invoice.trainerId,
        trainerName: invoice.trainerName,
        clientId: po.clientId,
        clientName: po.clientName,
        technology: invoice.technology,
        duration: invoice.duration,
        trainingAmount: invoice.trainingAmount,
        commissionPercent: this.commissionPercent(),
        commissionAmount: this.calculateCommission(),
        totalAmount: this.calculateTotal(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      this.apiService.createInvoice(clientInvoice).subscribe(() => {
        this.closeModal();
        this.loadData();
        alert('Invoice approved and sent to client!');
      });
    });
  }

  markAsPaid(invoice: Invoice): void {
    if (confirm('Mark this invoice as paid?')) {
      this.apiService.updateInvoice(invoice.id, {
        status: 'Paid',
        paidAt: new Date().toISOString()
      }).subscribe(() => {
        this.loadData();
        alert('Invoice marked as paid!');
      });
    }
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
