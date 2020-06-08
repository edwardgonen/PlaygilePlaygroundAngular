import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-progressmonitor',
  templateUrl: './progressmonitor.component.html',
  styleUrls: ['./progressmonitor.component.css']
})
export class ProgressmonitorComponent implements OnInit {
  progress_monitor = 'Progress monitor';
  constructor() { }

  ngOnInit(): void {
  }

}
