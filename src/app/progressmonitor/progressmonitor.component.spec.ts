import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressmonitorComponent } from './progressmonitor.component';

describe('ProgressmonitorComponent', () => {
  let component: ProgressmonitorComponent;
  let fixture: ComponentFixture<ProgressmonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressmonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressmonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
