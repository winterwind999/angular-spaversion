import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionAlertDialog } from './version-alert-dialog';

describe('VersionAlertDialog', () => {
  let component: VersionAlertDialog;
  let fixture: ComponentFixture<VersionAlertDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VersionAlertDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionAlertDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
