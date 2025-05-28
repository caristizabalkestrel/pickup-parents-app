import { Injectable } from '@angular/core';
import { ParentProfile } from 'src/app/core/auth/models/parent-profile.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  getParentProfile(): ParentProfile | null {
    const profileString = sessionStorage.getItem('parentProfile');
    if (profileString) {
      try {
        return JSON.parse(profileString) as ParentProfile;
      } catch (error) {
        console.error('Error al parsear el perfil del padre desde sessionStorage:', error);
        return null;
      }
    }
    return null;
  }

  setParentProfile(profile: ParentProfile) {
    sessionStorage.setItem('parentProfile', JSON.stringify(profile));
  }

  clearParentProfile() {
    sessionStorage.removeItem('parentProfile');
  }
}
