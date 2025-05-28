import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Promise<boolean | UrlTree> {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          resolve(this.router.createUrlTree(['/home']));
        } else {
          resolve(true);
        }
      });
    });
  }
}
