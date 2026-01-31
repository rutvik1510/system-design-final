// User model for authentication
export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'trainer' | 'client';
  name: string;
}

// Purchase Order model
export interface PurchaseOrder {
  id: number;
  clientId: number;
  clientName: string;
  companyName: string;
  email: string;
  phone: string;
  trainingRequirement: string;
  technology: string;
  duration: string;
  expectedStartDate: string;
  budget: number;
  status: 'Pending' | 'Assigned' | 'Accepted' | 'Rejected' | 'Completed' | 'Invoiced';
  assignedTrainerId?: number;
  assignedTrainerName?: string;
  createdAt: string;
}

// Training Request model
export interface TrainingRequest {
  id: number;
  purchaseOrderId: number;
  trainerId: number;
  trainerName: string;
  clientName: string;
  technology: string;
  duration: string;
  budget: number;
  status: 'Sent' | 'Accepted' | 'Rejected' | 'Completed';
  createdAt: string;
  completedAt?: string;
}

// Invoice model
export interface Invoice {
  id: number;
  type: 'trainer-to-admin' | 'admin-to-client';
  purchaseOrderId: number;
  trainingRequestId: number;
  
  // Common fields
  technology: string;
  duration: string;
  
  // For trainer invoice
  trainerId?: number;
  trainerName?: string;
  trainingAmount: number;
  
  // For client invoice (includes commission)
  clientId?: number;
  clientName?: string;
  commissionPercent?: number;
  commissionAmount?: number;
  totalAmount: number;
  
  status: 'Pending' | 'Approved' | 'Paid';
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

// Trainer profile model
export interface Trainer {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  expertise: string[];
  yearsOfExperience: number;
  bio: string;
  certifications: string[];
  hourlyRate: number;
  availability: 'Available' | 'Busy' | 'On Leave';
  rating: number;
  totalTrainings: number;
  profileImage?: string;
  linkedIn?: string;
  createdAt: string;
}

// Client profile model
export interface Client {
  id: number;
  userId: number;
  name: string;
  company: string;
  email: string;
}
