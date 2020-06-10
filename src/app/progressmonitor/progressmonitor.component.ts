import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-progressmonitor',
  templateUrl: './progressmonitor.component.html',
  styleUrls: ['./progressmonitor.component.css']
})

/*
6/1/2020,350
6/15/2020,320
etc.
*/

export class ProgressmonitorComponent implements OnInit {

  TestProgressData : string = "6/1/2020,350\n6/15/2020,320";
  public lineChart: GoogleChartInterface = {
    chartType: 'LineChart',
    dataTable: [
      ['Date', 'Ideal', 'Predicted'],
      ['6/1/2020', 350, 350],
      ['6/15/2020', 300, 320]
    ],
    options: {
      //'legend': 'none',
      'legend' : {'position' : 'right', 'alignment' : 'center'},
      'width': '700',
      'height': '350',
      'hAxis' : {'title' : 'Date'},
      'vAxis' : {'title' : 'Remaining Story Points', 'minValue' : '0'},
      'lineWidth' : '4',
    }
  };

  SprintLength = new FormControl('');
  TeamVelocity = new FormControl('');
  progressData = new FormControl('');
  IdealProjectEnd : string;
  PredictedProjectEnd : string;
  


  idealEstimationsStoryPoints : number[] = new Array();
  idealEstimatinsDates : Date[] = new Array();

  loadedEstimationsStoryPoints : number[] = new Array();
  loadedEstimatinsDates : Date[] = new Array();

  recalculateClick(event) {

      this.idealEstimationsStoryPoints  = new Array();
      this.idealEstimatinsDates = new Array();
    
      this.loadedEstimationsStoryPoints = new Array();
      this.loadedEstimatinsDates = new Array();
      if (!this.progressData.value) 
      {
        alert ("Please enter or paste the Project progress data in the CSV format");
        return;
      };

      //get and validate sprint length and velocity
  
      var teamVelocity = parseInt(this.TeamVelocity.value);
      if (Number.isNaN(teamVelocity) || teamVelocity <= 0) 
      {
        alert('Wrong Team Velocity ' + this.TeamVelocity.value);
        return;
      }
      var sprintLength = parseInt(this.SprintLength.value);
      if (Number.isNaN(sprintLength) || sprintLength <= 0) 
      {
        alert('Wrong Sprint length ' + this.SprintLength.value);
        return;
      }
      

    //read and analyze progress data
      this.parseProgressData(this.progressData.value);
      this.calculateAllDataIdealAndPrediction(teamVelocity, sprintLength);




      let ccComponent = this.lineChart.component;
      let ccWrapper = ccComponent.wrapper;

      //let's show it on the chart
      var newDataTable : (string | number)[][] =   [['Date', 'Ideal', 'Predicted']];
      //which data set is longer?

      var xAxisSet : Date[];
      if (this.loadedEstimatinsDates.length >= this.idealEstimatinsDates.length)
      {
        xAxisSet = this.loadedEstimatinsDates;
      }
      else
      {
        xAxisSet = this.idealEstimatinsDates;
      }

      for (var i = 0; i < xAxisSet.length; i++)
      {
        newDataTable.push([xAxisSet[i].toLocaleDateString(), this.idealEstimationsStoryPoints[i], this.loadedEstimationsStoryPoints[i]]);
      }
      this.lineChart.dataTable = newDataTable;

      //the real sprint end date is 1 day before the next sprint starts. So subsctact 1 for the right end date
      var tmpDate1 : Date;
      tmpDate1 = this.addDays(new Date(this.idealEstimatinsDates[this.idealEstimatinsDates.length - 1]), -1);
      this.IdealProjectEnd = tmpDate1.toLocaleDateString();
      var tmpDate2 : Date;
      tmpDate2 = this.addDays(this.loadedEstimatinsDates[this.loadedEstimatinsDates.length - 1], -1);
      this.PredictedProjectEnd = tmpDate2.toLocaleDateString();
      //force a redraw
      ccComponent.draw();
  };
  //auxiliary methods
  daysBetweenDates(latterDate : Date, formerDate : Date) : number
  {
    var diff = Math.abs(latterDate.getTime() - formerDate.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24)); 
  }
  addDays(date: Date, days: number): Date {
    var tmpDate : Date = date;
    tmpDate.setDate(tmpDate.getDate() + days);
    return tmpDate;
  }

  parseProgressData(content : string)
  {
    try
    {
      //const content = this.progressData.value;
      var lines = content.split("\n");
      if (lines.length <= 0)
      {
        alert("Missing progress data. Please verify");
        return;
      }

      for(var i = 0; i < lines.length; i++){
        var currentline = lines[i].split(",");
        if (currentline.length != 2)
        {
          //alert('Wrong progress data format. Ensure it is in the CSV form <date>,<remaining points>');
          continue; //ignore the string
        }
        var tmpRemaining = parseFloat(currentline[1]);
        if (Number.isNaN(tmpRemaining)) 
        {
          alert('Wrong remaining amount ' + currentline[1]);
          return;
        }
        if (Number.isNaN(Date.parse(currentline[0])))
        {
          alert('Wrong date ' + currentline[0]);
          return;
        }
        var tmpDate : Date = new Date(currentline[0]);
        this.loadedEstimationsStoryPoints.push(tmpRemaining);
        this.loadedEstimatinsDates.push(new Date(tmpDate));
      } //for on lines
    }
    catch (Error)
    {
      alert("Parsing progress data problem " + Error);
    };
  }

  calculateAllDataIdealAndPrediction(teamVelocity : number, sprintLength : number)
  {
    var lastDateTime : Date = new Date(this.loadedEstimatinsDates[this.loadedEstimatinsDates.length - 1]);
    var startProjectDateTime : Date = new Date(this.loadedEstimatinsDates[0]);
    var daysLeftSinceLastUpdateTillEndOfSprint = this.daysBetweenDates(lastDateTime, startProjectDateTime) % sprintLength;
    var recentSprintEnd : Date = new Date(this.addDays(lastDateTime, sprintLength - daysLeftSinceLastUpdateTillEndOfSprint));
    var remainingWorkInRecentSprint : number =
        teamVelocity * ((sprintLength - daysLeftSinceLastUpdateTillEndOfSprint) / sprintLength);
    var momentaryEstimation : number = this.loadedEstimationsStoryPoints[this.loadedEstimationsStoryPoints.length - 1] - remainingWorkInRecentSprint;

    //first let's set the predicted point to the end of recent sprint
    this.loadedEstimatinsDates.push(new Date(recentSprintEnd));
    this.loadedEstimationsStoryPoints.push(momentaryEstimation);

    //calculate prediction
    var pointDate : Date = recentSprintEnd;
    do
    {
        pointDate = new Date(this.addDays(pointDate, sprintLength));
        momentaryEstimation -= teamVelocity;
        this.loadedEstimatinsDates.push(new Date(pointDate));
        this.loadedEstimationsStoryPoints.push(Math.max(momentaryEstimation, 0));
    } while (momentaryEstimation > 0);

    //calculate ideal

    momentaryEstimation = this.loadedEstimationsStoryPoints[0];
    pointDate = new Date(this.loadedEstimatinsDates[0]);
    this.idealEstimationsStoryPoints.push(momentaryEstimation);
    this.idealEstimatinsDates.push(new Date(pointDate));
    do
    {
        momentaryEstimation -= teamVelocity;
        pointDate = new Date(this.addDays(pointDate, sprintLength));         
        this.idealEstimationsStoryPoints.push(Math.max(momentaryEstimation, 0));         
        this.idealEstimatinsDates.push(new Date(pointDate));
    } while (momentaryEstimation > 0);
  }


  constructor() {
    //this.progressData.setValue(this.TestProgressData);
    this.SprintLength.setValue('14');
    this.TeamVelocity.setValue('50');
   }

  ngOnInit(): void {
  }

}
