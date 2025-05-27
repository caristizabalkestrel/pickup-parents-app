import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private _isLoading = new BehaviorSubject<boolean>(false);
  public isLoading$ = this._isLoading.asObservable();

  constructor() { }

  setLoading(isLoading: boolean) {
    this._isLoading.next(isLoading);
    console.log('Loading state changed:', isLoading);
  }

}
