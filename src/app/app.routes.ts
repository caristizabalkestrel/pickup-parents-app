import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./feature/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./feature/auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'students',
    loadComponent: () => import('./feature/students/students.page').then( m => m.StudentsPage)
  },
  {
    path: 'parets',
    loadComponent: () => import('./feature/parets/parets.page').then( m => m.ParetsPage)
  },
];
