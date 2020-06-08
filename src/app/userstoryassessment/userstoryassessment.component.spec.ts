import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserstoryassessmentComponent } from './userstoryassessment.component';

describe('UserstoryassessmentComponent', () => {
  let component: UserstoryassessmentComponent;
  let fixture: ComponentFixture<UserstoryassessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserstoryassessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserstoryassessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
