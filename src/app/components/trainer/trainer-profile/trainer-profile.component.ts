import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { Trainer } from '../../../models/models';

@Component({
  selector: 'app-trainer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.css'
})
export class TrainerProfileComponent implements OnInit {
  trainer = signal<Trainer | null>(null);
  isLoading = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Editable form fields
  editForm = signal<Partial<Trainer>>({});
  newCertification = signal<string>('');

  availableTechnologies = [
    'Angular', 'React', 'Vue.js', 'Node.js', 'Java', 'Spring Boot',
    'Python', 'Django', 'Flask', 'AWS', 'Azure', 'GCP', 'Docker',
    'Kubernetes', 'TypeScript', 'JavaScript', 'SQL', 'MongoDB',
    'Machine Learning', 'Data Science', 'DevOps', 'CI/CD',
    'iOS', 'Swift', 'Android', 'Kotlin', 'Flutter', 'React Native'
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.apiService.getTrainerByUserId(userId).subscribe({
      next: (trainer) => {
        this.trainer.set(trainer);
        if (trainer) {
          this.editForm.set({ ...trainer });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  startEditing(): void {
    const currentTrainer = this.trainer();
    if (currentTrainer) {
      this.editForm.set({ ...currentTrainer });
    }
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    const currentTrainer = this.trainer();
    if (currentTrainer) {
      this.editForm.set({ ...currentTrainer });
    }
  }

  updateFormField(field: string, value: any): void {
    this.editForm.update(form => ({ ...form, [field]: value }));
  }

  toggleExpertise(tech: string): void {
    const currentExpertise = this.editForm().expertise || [];
    if (currentExpertise.includes(tech)) {
      this.updateFormField('expertise', currentExpertise.filter(t => t !== tech));
    } else {
      this.updateFormField('expertise', [...currentExpertise, tech]);
    }
  }

  isExpertiseSelected(tech: string): boolean {
    return (this.editForm().expertise || []).includes(tech);
  }

  addCertification(): void {
    const cert = this.newCertification().trim();
    if (cert) {
      const currentCerts = this.editForm().certifications || [];
      if (!currentCerts.includes(cert)) {
        this.updateFormField('certifications', [...currentCerts, cert]);
      }
      this.newCertification.set('');
    }
  }

  removeCertification(cert: string): void {
    const currentCerts = this.editForm().certifications || [];
    this.updateFormField('certifications', currentCerts.filter(c => c !== cert));
  }

  saveProfile(): void {
    const currentTrainer = this.trainer();
    const form = this.editForm();
    
    if (!currentTrainer || !form) return;

    this.isSaving.set(true);

    this.apiService.updateTrainer(currentTrainer.id, form).subscribe({
      next: (updatedTrainer) => {
        this.trainer.set(updatedTrainer);
        this.isEditing.set(false);
        this.isSaving.set(false);
        alert('Profile updated successfully!');
      },
      error: () => {
        this.isSaving.set(false);
        alert('Error updating profile. Please try again.');
      }
    });
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
