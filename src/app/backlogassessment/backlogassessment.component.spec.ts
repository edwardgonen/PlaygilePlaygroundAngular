import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BacklogassessmentComponent } from './backlogassessment.component';

describe('BacklogassessmentComponent', () => {
  let component: BacklogassessmentComponent;
  let fixture: ComponentFixture<BacklogassessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BacklogassessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BacklogassessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
