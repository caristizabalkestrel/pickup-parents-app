import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/guard/auth.guard';
import { NoAuthGuard } from './core/auth/guard/no-auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./feature/auth/login/login.page').then( m => m.LoginPage),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./feature/auth/register/register.page').then( m => m.RegisterPage),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'students',
    loadComponent: () => import('./feature/students/students.page').then( m => m.StudentsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'parets',
    loadComponent: () => import('./feature/parets/parets.page').then( m => m.ParetsPage),
    canActivate: [AuthGuard]
  },
];
