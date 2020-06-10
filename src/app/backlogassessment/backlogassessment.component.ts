import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts';

@Component({
  selector: 'app-backlogassessment',
  templateUrl: './backlogassessment.component.html',
  styleUrls: ['./backlogassessment.component.css']
})


export class BacklogassessmentComponent implements OnInit {

  Score : number = 0;
  p : number[] = [0, 0, 0, 0];

  public columnChart: GoogleChartInterface = {
    chartType: 'ColumnChart',
    dataTable: [
      ['Day', 'Completed'],
      ['4', this.p[0]],
      ['3', this.p[1]],
      ['2', this.p[2]],
      ['1', this.p[3]]    
    ],
    //firstRowIsData: true,
    options: {
      'legend': 'none',
      'width': '700',
      'height': '350',
      'hAxis' : {'title' : 'Days to Sprint End', 'minValue' : '1', 'maxValue' : '4'},
      'vAxis' : {'title' : 'Daily Readiness %', 'minValue' : '0', 'maxValue' : '100'}
    }
  };

  onDay4InputChange(event) {
    this.p[0] = event.value;
    this.RefreshChart();
  };

  onDay3InputChange(event) {
    this.p[1] = event.value;
    this.RefreshChart();
  }

  onDay2InputChange(event) {
    this.p[2] = event.value;
    this.RefreshChart();
  }
  onDay1InputChange(event) {
    this.p[3] = event.value;
    this.RefreshChart();
  }

  RefreshChart()
  {
    this.columnChart.dataTable = [
      ['Day', 'Completed'],
      ['4', this.p[0]],
      ['3', this.p[1]],
      ['2', this.p[2]],
      ['1', this.p[3]]
 
    ];

    //calculation
 
    const numOfDays : number = 4;
    const maxTotalScore : number = 100.0;

    let weight : number[] = [1.0, 5.0, 10.0, 50.0 ];
    let expectedPercentage : number[] = [100.0, 100.0, 100.0, 100.0 ];
    let dayScore : number[] = [0, 0, 0, 0];


    let minimalDayScore : number[] = [0, 0, 0, 0];
    let dayScoreAdjustedByWeight : number[] = [0, 0, 0, 0];
    let maximalDayScore : number[] = [0, 0, 0, 0];
    let normalizedDayScore : number[] = [0, 0, 0, 0];
    
    let maxTotalDayScore : number = 0;
    let minTotalDayScore : number = 0;

    for (let i = 0; i < numOfDays; i++) {
      minimalDayScore[i] = -100.0 * weight[i];
      minTotalDayScore += minimalDayScore[i];
      maximalDayScore[i] = 0;
      maxTotalDayScore += maximalDayScore[i];
    };

    
    let normalization : number = maxTotalScore / (maxTotalDayScore - minTotalDayScore);
    let totalNormalizedDayScore : number = 0;
 
    for (let i = 0; i < numOfDays; i++)
    {
        dayScore[i] = this.p[i] - expectedPercentage[i];
        dayScoreAdjustedByWeight[i] = dayScore[i] * weight[i];
        normalizedDayScore[i] = dayScoreAdjustedByWeight[i] * normalization;
        totalNormalizedDayScore += normalizedDayScore[i];
    }

    this.Score = Math.round(maxTotalScore + totalNormalizedDayScore);

  
    let ccComponent = this.columnChart.component;
    let ccWrapper = ccComponent.wrapper;
    //force a redraw
    ccComponent.draw();
  }

  ngOnInit(): void {
  }

}
