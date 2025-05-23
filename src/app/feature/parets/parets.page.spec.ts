import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParetsPage } from './parets.page';

describe('ParetsPage', () => {
  let component: ParetsPage;
  let fixture: ComponentFixture<ParetsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
