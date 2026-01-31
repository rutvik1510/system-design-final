import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-client-create-po',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-create-po.component.html',
  styleUrl: './client-create-po.component.css'
})
export class ClientCreatePoComponent {
  // Contact Information
  name = signal<string>('');
  companyName = signal<string>('');
  email = signal<string>('');
  phone = signal<string>('');
  
  // Training Details
  trainingRequirement = signal<string>('');
  technology = signal<string>('');
  duration = signal<string>('');
  expectedStartDate = signal<string>('');
  budget = signal<number | null>(null);
  
  isSubmitting = signal<boolean>(false);

  technologies = [
    'Angular',
    'React',
    'Vue.js',
    'Node.js',
    'Java',
    'Python',
    'Spring Boot',
    'AWS',
    'Azure',
    'Docker',
    'Kubernetes',
    'Machine Learning',
    'Data Science',
    'DevOps',
    'Other'
  ];

  durations = [
    '1 Week',
    '2 Weeks',
    '3 Weeks',
    '1 Month',
    '2 Months',
    '3 Months',
    '6 Months'
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    // Pre-fill name from auth
    const userName = this.authService.getUserName();
    if (userName) {
      this.name.set(userName);
    }
  }

  // Get minimum date (today) for date picker
  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  submitPO(): void {
    const name = this.name();
    const companyName = this.companyName();
    const email = this.email();
    const phone = this.phone();
    const trainingRequirement = this.trainingRequirement();
    const technology = this.technology();
    const duration = this.duration();
    const expectedStartDate = this.expectedStartDate();
    const budget = this.budget();

    if (!name || !companyName || !email || !phone || !trainingRequirement || !technology || !duration || !expectedStartDate || !budget) {
      alert('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid phone number');
      return;
    }

    if (budget <= 0) {
      alert('Budget must be greater than 0');
      return;
    }

    this.isSubmitting.set(true);

    const userId = this.authService.getUserId();

    this.apiService.createPurchaseOrder({
      clientId: userId!,
      clientName: name,
      companyName,
      email,
      phone,
      trainingRequirement,
      technology,
      duration,
      expectedStartDate,
      budget,
      status: 'Pending',
      createdAt: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        alert('Purchase Order submitted successfully!');
        this.router.navigate(['/client/my-orders']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        alert('Error submitting PO. Please try again.');
        console.error('Error:', error);
      }
    });
  }

  resetForm(): void {
    const userName = this.authService.getUserName();
    this.name.set(userName || '');
    this.companyName.set('');
    this.email.set('');
    this.phone.set('');
    this.trainingRequirement.set('');
    this.technology.set('');
    this.duration.set('');
    this.expectedStartDate.set('');
    this.budget.set(null);
  }

  isFormValid(): boolean {
    return !!(
      this.name() &&
      this.companyName() &&
      this.email() &&
      this.phone() &&
      this.trainingRequirement() &&
      this.technology() &&
      this.duration() &&
      this.expectedStartDate() &&
      this.budget()
    );
  }
}
