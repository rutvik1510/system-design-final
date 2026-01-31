import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { PurchaseOrder, TrainingRequest, Trainer, Invoice } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ==================== PURCHASE ORDERS ====================
  
  // Get all purchase orders
  getAllPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/purchaseOrders`);
  }

  // Get purchase orders by client ID
  getPurchaseOrdersByClient(clientId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/purchaseOrders?clientId=${clientId}`);
  }

  // Create purchase order
  createPurchaseOrder(po: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/purchaseOrders`, po);
  }

  // Update purchase order
  updatePurchaseOrder(id: number | string, po: Partial<PurchaseOrder>): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/purchaseOrders/${id}`, po);
  }

  // ==================== TRAINING REQUESTS ====================
  
  // Get all training requests
  getAllTrainingRequests(): Observable<TrainingRequest[]> {
    return this.http.get<TrainingRequest[]>(`${this.apiUrl}/trainingRequests`);
  }

  // Get training requests by trainer ID (from trainers collection)
  getTrainingRequestsByTrainer(trainerId: number): Observable<TrainingRequest[]> {
    return this.http.get<TrainingRequest[]>(`${this.apiUrl}/trainingRequests?trainerId=${trainerId}`);
  }

  // Get training requests for logged in trainer (by userId)
  getTrainingRequestsForLoggedInTrainer(userId: number): Observable<TrainingRequest[]> {
    // First get the trainer profile for this user
    return this.getTrainerByUserId(userId).pipe(
      switchMap(trainer => {
        if (trainer) {
          // Get requests for this trainer's ID
          return this.http.get<TrainingRequest[]>(`${this.apiUrl}/trainingRequests?trainerId=${trainer.id}`);
        }
        // If no trainer profile, return empty array
        return new Observable<TrainingRequest[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      })
    );
  }

  // Create training request
  createTrainingRequest(request: Partial<TrainingRequest>): Observable<TrainingRequest> {
    return this.http.post<TrainingRequest>(`${this.apiUrl}/trainingRequests`, request);
  }

  // Update training request status
  updateTrainingRequest(id: number | string, request: Partial<TrainingRequest>): Observable<TrainingRequest> {
    return this.http.patch<TrainingRequest>(`${this.apiUrl}/trainingRequests/${id}`, request);
  }

  // ==================== TRAINERS ====================
  
  // Get all trainers
  getAllTrainers(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(`${this.apiUrl}/trainers`);
  }

  // Get trainer by ID
  getTrainerById(id: number): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/trainers/${id}`);
  }

  // Get trainer by user ID
  getTrainerByUserId(userId: number): Observable<Trainer | null> {
    return this.http.get<Trainer[]>(`${this.apiUrl}/trainers?userId=${userId}`).pipe(
      map(trainers => trainers.length > 0 ? trainers[0] : null)
    );
  }

  // Create trainer
  createTrainer(trainer: Partial<Trainer>): Observable<Trainer> {
    return this.http.post<Trainer>(`${this.apiUrl}/trainers`, trainer);
  }

  // Update trainer
  updateTrainer(id: number, trainer: Partial<Trainer>): Observable<Trainer> {
    return this.http.patch<Trainer>(`${this.apiUrl}/trainers/${id}`, trainer);
  }

  // ==================== DASHBOARD STATS ====================
  
  // Get stats for admin dashboard
  getAdminStats(): Observable<{ total: number; pending: number; accepted: number }> {
    return new Observable(observer => {
      this.getAllPurchaseOrders().subscribe(orders => {
        const stats = {
          total: orders.length,
          pending: orders.filter(o => o.status === 'Pending').length,
          accepted: orders.filter(o => o.status === 'Accepted').length
        };
        observer.next(stats);
        observer.complete();
      });
    });
  }

  // ==================== INVOICES ====================
  
  // Get all invoices
  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`);
  }

  // Get invoices by type
  getInvoicesByType(type: 'trainer-to-admin' | 'admin-to-client'): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices?type=${type}`);
  }

  // Get invoices for trainer
  getInvoicesByTrainer(trainerId: number | string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices?trainerId=${trainerId}`);
  }

  // Get invoices for client
  getInvoicesByClient(clientId: number | string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices?clientId=${clientId}`);
  }

  // Create invoice
  createInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices`, invoice);
  }

  // Update invoice
  updateInvoice(id: number | string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.apiUrl}/invoices/${id}`, invoice);
  }
}
