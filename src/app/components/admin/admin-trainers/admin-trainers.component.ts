import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Trainer } from '../../../models/models';

@Component({
  selector: 'app-admin-trainers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-trainers.component.html',
  styleUrl: './admin-trainers.component.css'
})
export class AdminTrainersComponent implements OnInit {
  trainers = signal<Trainer[]>([]);
  isLoading = signal<boolean>(false);
  showDetailsModal = signal<boolean>(false);
  selectedTrainer = signal<Trainer | null>(null);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadTrainers();
  }

  loadTrainers(): void {
    this.isLoading.set(true);
    this.apiService.getAllTrainers().subscribe(trainers => {
      this.trainers.set(trainers);
      this.isLoading.set(false);
    });
  }

  openDetailsModal(trainer: Trainer): void {
    this.selectedTrainer.set(trainer);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedTrainer.set(null);
  }

  getAvailabilityBadgeClass(availability: string): string {
    switch (availability) {
      case 'Available': return 'bg-success';
      case 'Busy': return 'bg-warning text-dark';
      case 'On Leave': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
