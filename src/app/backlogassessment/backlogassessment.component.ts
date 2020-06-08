import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-backlogassessment',
  templateUrl: './backlogassessment.component.html',
  styleUrls: ['./backlogassessment.component.css']
})
export class BacklogassessmentComponent implements OnInit {
  bl_assessment = 'Backlog assessment';
  constructor() { }

  ngOnInit(): void {
  }

}
