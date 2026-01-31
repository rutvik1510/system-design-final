import { Routes } from '@angular/router';
import { adminGuard, trainerGuard, clientGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default route - Role Selection
  {
    path: '',
    loadComponent: () => import('./components/role-selection/role-selection.component')
      .then(m => m.RoleSelectionComponent)
  },

  // Admin Routes
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'purchase-orders',
        loadComponent: () => import('./components/admin/admin-purchase-orders/admin-purchase-orders.component')
          .then(m => m.AdminPurchaseOrdersComponent)
      },
      {
        path: 'training-requests',
        loadComponent: () => import('./components/admin/admin-training-requests/admin-training-requests.component')
          .then(m => m.AdminTrainingRequestsComponent)
      },
      {
        path: 'trainers',
        loadComponent: () => import('./components/admin/admin-trainers/admin-trainers.component')
          .then(m => m.AdminTrainersComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./components/admin/admin-invoices/admin-invoices.component')
          .then(m => m.AdminInvoicesComponent)
      }
    ]
  },

  // Trainer Routes
  {
    path: 'trainer',
    loadComponent: () => import('./components/trainer/trainer-layout/trainer-layout.component')
      .then(m => m.TrainerLayoutComponent),
    canActivate: [trainerGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/trainer/trainer-dashboard/trainer-dashboard.component')
          .then(m => m.TrainerDashboardComponent)
      },
      {
        path: 'requests',
        loadComponent: () => import('./components/trainer/trainer-requests/trainer-requests.component')
          .then(m => m.TrainerRequestsComponent)
      },
      {
        path: 'accepted',
        loadComponent: () => import('./components/trainer/trainer-accepted/trainer-accepted.component')
          .then(m => m.TrainerAcceptedComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/trainer/trainer-profile/trainer-profile.component')
          .then(m => m.TrainerProfileComponent)
      }
    ]
  },

  // Client Routes
  {
    path: 'client',
    loadComponent: () => import('./components/client/client-layout/client-layout.component')
      .then(m => m.ClientLayoutComponent),
    canActivate: [clientGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/client/client-dashboard/client-dashboard.component')
          .then(m => m.ClientDashboardComponent)
      },
      {
        path: 'create-po',
        loadComponent: () => import('./components/client/client-create-po/client-create-po.component')
          .then(m => m.ClientCreatePoComponent)
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./components/client/client-orders/client-orders.component')
          .then(m => m.ClientOrdersComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./components/client/client-invoices/client-invoices.component')
          .then(m => m.ClientInvoicesComponent)
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: ''
  }
];
