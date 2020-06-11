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

  TestProgressData : string = `REPLACE THIS WHOLE TEXT WITH YOUR REAL DATA
  in the form of:
  6/1/2020,350
  6/15/2020,320
  etc.
  
  The date above is when you checked the remaining stories in the Backlog.
  The number after comma is the remaining amount of story points in the backlog at that date.
  Then press the Recalculate button above.
  You may enter as many strings as you want.`;
  public lineChart: GoogleChartInterface = {
    chartType: 'LineChart',
    dataTable: [
      ['Date', 'Ideal', 'Predicted'],
      ['6/1/2020', 0, 0]
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
  
  projectStartSpecified : boolean = false;
  projectInitialEstimationSpecified : boolean = false;
  idealEstimationsStoryPoints : number[] = new Array();
  idealEstimatinsDates : Date[] = new Array();

  progressEstimationsStoryPoints : number[] = new Array();
  progressEstimatinsDates : Date[] = new Array();

  recalculateClick(event) {

      this.idealEstimationsStoryPoints  = new Array();
      this.idealEstimatinsDates = new Array();
    
      this.progressEstimationsStoryPoints = new Array();
      this.progressEstimatinsDates = new Array();
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
      if (this.progressEstimatinsDates.length >= this.idealEstimatinsDates.length)
      {
        xAxisSet = this.progressEstimatinsDates;
      }
      else
      {
        xAxisSet = this.idealEstimatinsDates;
      }

      for (var i = 0; i < xAxisSet.length; i++)
      {
        newDataTable.push([xAxisSet[i].toLocaleDateString(), this.idealEstimationsStoryPoints[i], this.progressEstimationsStoryPoints[i]]);
      }
      this.lineChart.dataTable = newDataTable; //set new table


      var idealProjectEnd : Date = this.FindProjectEnd(this.idealEstimatinsDates, this.idealEstimationsStoryPoints);
      var predictedProjectEnd : Date  = this.FindProjectEnd(this.progressEstimatinsDates, this.progressEstimationsStoryPoints);
      this.IdealProjectEnd = idealProjectEnd.toLocaleDateString();
      this.PredictedProjectEnd = predictedProjectEnd.toLocaleDateString();

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
    var tmpDate : Date = new Date(date);
    tmpDate.setDate(tmpDate.getDate() + days);
    return tmpDate;
  }
  CalculateIdealEstimationByDate(projectStartDate : Date, currentDate : Date, initialProjectEstimation : number, dailyVelocity : number) : number
  {
      var distanceDays : number = this.daysBetweenDates(currentDate, projectStartDate);
      return (initialProjectEstimation - distanceDays * dailyVelocity);
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
        this.progressEstimationsStoryPoints.push(tmpRemaining);
        this.progressEstimatinsDates.push(new Date(tmpDate));
      } //for on lines
    }
    catch (Error)
    {
      alert("Parsing progress data problem " + Error);
    };
  }

  calculateAllDataIdealAndPrediction(teamVelocity : number, sprintLength : number)
  {
    var startProjectDateTime : Date;
    var initialProjectEstimation : number;
    if (this.projectStartSpecified)
    {
        //startProjectDateTime = specifiedProjectDate;
    }
    else
        startProjectDateTime = new Date(this.progressEstimatinsDates[0]);

    if (this.projectInitialEstimationSpecified)
    {
        //initialProjectEstimation = initialEstimationSpecified;
    }
    else
        initialProjectEstimation = this.progressEstimationsStoryPoints[0];

    var dailyVelocity : number = teamVelocity / sprintLength;
    var lastDateTimeInProjectData : Date = this.progressEstimatinsDates[this.progressEstimatinsDates.length - 1];
    var tmpPairDate : Date;
    var tmpPairValue : number;

    var daysLeftSinceLastUpdateTillEndOfSprint : number  = sprintLength - 1 - 
        this.daysBetweenDates(lastDateTimeInProjectData, startProjectDateTime) % sprintLength;
    var closestSprintEnd : Date = this.addDays(lastDateTimeInProjectData,daysLeftSinceLastUpdateTillEndOfSprint);

    if (daysLeftSinceLastUpdateTillEndOfSprint > 0)
    {
        //add predicted closest sprint end
        var remainingWorkInRecentSprint : number = dailyVelocity * daysLeftSinceLastUpdateTillEndOfSprint;
        var estimationHowWeFinishCurrentSprint : number = 
          this.progressEstimationsStoryPoints[this.progressEstimationsStoryPoints.length - 1] - remainingWorkInRecentSprint;
        tmpPairDate = new Date(closestSprintEnd);
        tmpPairValue = estimationHowWeFinishCurrentSprint;
        this.progressEstimatinsDates.push(tmpPairDate);
        this.progressEstimationsStoryPoints.push(tmpPairValue);
    }

    //to this point the predicted array contains real data from the past.
    //The dates of those estimations may not be on the sprint end
    //so we need to add those points to the ideal line to make both lines parallel in sense of dates
    //it is easy since the ideal is linear y = initial estimation -(DailyVelocity) * NumberOfDaysSinceProjectStarts
    tmpPairDate = new Date(startProjectDateTime);
    tmpPairValue = initialProjectEstimation;
    this.idealEstimatinsDates.push(tmpPairDate);
    this.idealEstimationsStoryPoints.push(tmpPairValue);

    for (var i = 1; i < this.progressEstimationsStoryPoints.length; i++)
    {
        //calculate this point distance from the project start
        var tmpEstimation : number = this.CalculateIdealEstimationByDate(this.addDays(startProjectDateTime, -1), this.progressEstimatinsDates[i], initialProjectEstimation, dailyVelocity);
        tmpPairDate = new Date(this.progressEstimatinsDates[i]);
        tmpPairValue = initialProjectEstimation;
        this.idealEstimatinsDates.push(tmpPairDate);
        this.idealEstimationsStoryPoints.push(tmpEstimation);
    }

    //calculate prediction
    //first let's set the predicted point to the end of recent sprint
    var lastSprintEnd : Date = new Date(closestSprintEnd);
    var endSprintExpectation : number;
    var lastFullSprintEndValue : number = this.progressEstimationsStoryPoints[this.progressEstimationsStoryPoints.length - 1];
    var pointDate : Date = new Date(lastSprintEnd);
    var continueAddingIdealPoints : boolean = true;
    do
    {
      pointDate = this.addDays(pointDate, sprintLength);
      endSprintExpectation = this.CalculateIdealEstimationByDate(lastSprintEnd, pointDate, lastFullSprintEndValue, dailyVelocity);
      tmpPairDate = new Date(pointDate);
      tmpPairValue = Math.max(endSprintExpectation, 0);
      this.progressEstimatinsDates.push(tmpPairDate);
      this.progressEstimationsStoryPoints.push(tmpPairValue);
        
      var idealEstimation : number = this.CalculateIdealEstimationByDate(this.addDays(startProjectDateTime, -1), pointDate, initialProjectEstimation, dailyVelocity);
      if (continueAddingIdealPoints)
      {

        tmpPairDate = new Date(pointDate);
        tmpPairValue = Math.max(idealEstimation, 0);
        this.idealEstimatinsDates.push(tmpPairDate);
        this.idealEstimationsStoryPoints.push(tmpPairValue);
        if (idealEstimation <= 0) continueAddingIdealPoints = false;
      }
    } while (endSprintExpectation > 0);
  }

  FindProjectEnd(inputDatesArray : Date[], inputValuesArray : number[]) : Date
  {
    //end of the project for each set is the first date where the estimation is 0
    var predictedProjectEnd : Date  = null;
    //end of the project for each set is the first date where the estimation is 0
    for (var i = 0; i < inputValuesArray.length; i++)
    {
        if (inputValuesArray[i] <= 0)
        {
            predictedProjectEnd = new Date(inputDatesArray[i]);
            break;
        }
    }
    return predictedProjectEnd;
  }


  constructor() {
    this.progressData.setValue(this.TestProgressData);
    this.SprintLength.setValue('14');
    this.TeamVelocity.setValue('50');
   }

  ngOnInit(): void {
  }
}
