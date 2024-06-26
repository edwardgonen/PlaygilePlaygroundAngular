import { Component, OnInit } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts';
import { FormControl } from '@angular/forms';


import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../shared/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from '../shared/alert-dialog/alert-dialog.component';

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
      [new Date('6/1/2020'), 0, 0]
    ],
    options: {
      //'legend': 'none',
      'legend' : {'position' : 'right', 'alignment' : 'center'},
      'width': '700',
      'height': '350',
      'hAxis' : 
        {
          'title' : 'Date', 
          'format' : 'M/d/yy'
        },
      'vAxis' : {'title' : 'Remaining Story Points', 'minValue' : '0'},
      'lineWidth' : '4',
      scales: {
        xAxes: [{
            type: 'time',
            time: {
                unit: 'day',
            }
        }]
    }
    }
  };

  SprintLength = new FormControl('');
  TeamVelocity = new FormControl('');
  progressData = new FormControl('');
  IdealProjectEnd : string;
  PredictedProjectEnd : string;
  
  projectStartSpecified : boolean = false;
  projectInitialEstimationSpecified : boolean = false;


  idealEstimations : { date: Date, value: number}[] = new Array();

  progressEstimations : { date: Date, value: number}[] = new Array();
  

  recalculateClick(event) {
      this.idealEstimations  = new Array();  
      this.progressEstimations = new Array();
      if (!this.progressData.value) 
      {
        this.openAlertDialog("Please enter or paste the Project progress data in the CSV format");
        return;
      };

      //get and validate sprint length and velocity
  
      var teamVelocity = parseInt(this.TeamVelocity.value);
      if (Number.isNaN(teamVelocity) || teamVelocity <= 0) 
      {
        this.openAlertDialog('Wrong Team Velocity ' + this.TeamVelocity.value);
        return;
      }
      var sprintLength = parseInt(this.SprintLength.value);
      if (Number.isNaN(sprintLength) || sprintLength <= 0) 
      {
        this.openAlertDialog('Wrong Sprint length ' + this.SprintLength.value);
        return;
      }

      if (sprintLength != 14) //not regular sprint
      {
        this.openAlertDialog("You have specified spring length of " + sprintLength + " days which is irregular. Don't forget to update the team velocity accordingly.");
      }
      

    //read and analyze progress data
      this.parseProgressData(this.progressData.value);
      this.calculateAllDataIdealAndPrediction(teamVelocity, sprintLength);




      let ccComponent = this.lineChart.component;
      let ccWrapper = ccComponent.wrapper;

      //let's show it on the chart
      var newDataTable : (any)[][] =   [['Date', 'Ideal', 'Predicted']];
      //which data set is longer?

      var xAxisSet : Date[] = new Array();
      if (this.progressEstimations.length >= this.idealEstimations.length)
      {
        for (var i = 0; i < this.progressEstimations.length; i++)
          xAxisSet.push(this.progressEstimations[i].date);
      }
      else
      {
        for (var i = 0; i < this.idealEstimations.length; i++)
          xAxisSet.push(this.idealEstimations[i].date);
      }

      var tmpValueIdeal, tmpValueProgress;
      for (var i = 0; i < xAxisSet.length; i++)
      {
        if (i < this.idealEstimations.length)
          tmpValueIdeal = this.idealEstimations[i].value;
        else
          tmpValueIdeal = null;
        
        if (i < this.progressEstimations.length)
          tmpValueProgress = this.progressEstimations[i].value;
        else
          tmpValueProgress = null;  

        newDataTable.push([xAxisSet[i], tmpValueIdeal, tmpValueProgress]);
      }
      this.lineChart.dataTable = newDataTable; //set new table


      var idealProjectEnd : Date = this.FindProjectEnd(this.idealEstimations);
      var predictedProjectEnd : Date  = this.FindProjectEnd(this.progressEstimations);
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
      return Math.max(initialProjectEstimation - distanceDays * dailyVelocity, 0);
  }
  parseProgressData(content : string)
  {
    try
    {
      //const content = this.progressData.value;
      var lines = content.split("\n");
      if (lines.length <= 0)
      {
        this.openAlertDialog("Missing progress data. Please verify");
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
          this.openAlertDialog('Wrong remaining amount ' + currentline[1]);
          return;
        }
        if (Number.isNaN(Date.parse(currentline[0])))
        {
          this.openAlertDialog('Wrong date ' + currentline[0]);
          return;
        }
        var tmpDate : Date = new Date(currentline[0]);
        this.progressEstimations.push({ "date": tmpDate, "value": tmpRemaining });
      } //for on lines
      //need to sort the progress in ascending order of date
      this.progressEstimations.sort((a, b) => (a.date > b.date) ? 1 : -1)
    }
    catch (Error)
    {
      this.openAlertDialog("Parsing progress data problem " + Error);
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
        startProjectDateTime = new Date(this.progressEstimations[0].date);

    if (this.projectInitialEstimationSpecified)
    {
        //initialProjectEstimation = initialEstimationSpecified;
    }
    else
        initialProjectEstimation = this.progressEstimations[0].value;

    var dailyVelocity : number = teamVelocity / sprintLength;
    var lastDateTimeInProjectData : Date = this.progressEstimations[this.progressEstimations.length - 1].date;
    var tmpPairDate : Date;
    var tmpPairValue : number;

    var daysLeftSinceLastUpdateTillEndOfSprint : number  = sprintLength - 1 - 
        this.daysBetweenDates(lastDateTimeInProjectData, startProjectDateTime) % sprintLength;
    var closestSprintEnd : Date = this.addDays(lastDateTimeInProjectData,daysLeftSinceLastUpdateTillEndOfSprint);
    
    var endSprintExpectation : number;
    var idealEstimation : number;
    
    if (daysLeftSinceLastUpdateTillEndOfSprint > 0)
    {
        //add predicted closest sprint end
        var remainingWorkInRecentSprint : number = dailyVelocity * daysLeftSinceLastUpdateTillEndOfSprint;

        var estimationHowWeFinishCurrentSprint : number = 
          Math.max(this.progressEstimations[this.progressEstimations.length - 1].value - remainingWorkInRecentSprint, 0);
        tmpPairDate = new Date(closestSprintEnd);
        endSprintExpectation = estimationHowWeFinishCurrentSprint;
        this.progressEstimations.push({ "date": tmpPairDate, "value": endSprintExpectation });
    }

    //to this point the predicted array contains real data from the past.
    //The dates of those estimations may not be on the sprint end
    //so we need to add those points to the ideal line to make both lines parallel in sense of dates
    //it is easy since the ideal is linear y = initial estimation -(DailyVelocity) * NumberOfDaysSinceProjectStarts
    tmpPairDate = new Date(startProjectDateTime);
    tmpPairValue = initialProjectEstimation;
    this.idealEstimations.push({ "date": tmpPairDate, "value": tmpPairValue });
    

    for (var i = 1; i < this.progressEstimations.length; i++)
    {
        //calculate this point distance from the project start
        idealEstimation = this.CalculateIdealEstimationByDate(startProjectDateTime, this.progressEstimations[i].date, initialProjectEstimation, dailyVelocity);
        tmpPairDate = new Date(this.progressEstimations[i].date);
        this.idealEstimations.push({ "date": tmpPairDate, "value": idealEstimation });
        if (idealEstimation <= 0) break; //finished so no more loops
    }

    //calculate prediction
    //first let's set the predicted point to the end of recent sprint
    var lastSprintEnd : Date = new Date(closestSprintEnd);

    var lastFullSprintEndValue : number = this.progressEstimations[this.progressEstimations.length - 1].value;
    var pointDate : Date = new Date(lastSprintEnd);
    var continueAddingIdealPoints : boolean = true;
    var contunueAddingProgressPoints : boolean = true;
    while (endSprintExpectation > 0 || idealEstimation > 0)
    {
      pointDate = this.addDays(pointDate, sprintLength);

      endSprintExpectation = this.CalculateIdealEstimationByDate(lastSprintEnd, pointDate, lastFullSprintEndValue, dailyVelocity);     
      if (contunueAddingProgressPoints)
      {
        tmpPairDate = new Date(pointDate);
        tmpPairValue = Math.max(endSprintExpectation, 0);
        this.progressEstimations.push({ "date": tmpPairDate, "value": tmpPairValue });
        if (endSprintExpectation <= 0) contunueAddingProgressPoints = false;
      }
        
      idealEstimation = this.CalculateIdealEstimationByDate(startProjectDateTime, pointDate, initialProjectEstimation, dailyVelocity);
      if (continueAddingIdealPoints)
      {
        tmpPairDate = new Date(pointDate);
        tmpPairValue = Math.max(idealEstimation, 0);
        this.idealEstimations.push({ "date": tmpPairDate, "value": tmpPairValue });
        if (idealEstimation <= 0) continueAddingIdealPoints = false;
      }
    };
  }

  FindProjectEnd(inputArray : { date: Date, value: number}[]) : Date
  {
    //end of the project for each set is the first date where the estimation is 0
    var predictedProjectEnd : Date  = null;
    //end of the project for each set is the first date where the estimation is 0
    for (var i = 0; i < inputArray.length; i++)
    {
        if (inputArray[i].value <= 0)
        {
            predictedProjectEnd = new Date(inputArray[i].date);
            break;
        }
    }
    return predictedProjectEnd;
  }

  ////////////// shared dialog related stuff////////////////////
  openDialog(message : string, okbuttontext : string, cancelbuttontext : string) {
    const dialogRef = this.dialog.open(ConfirmationDialog,{
      data:{
        message: message,
        buttonText: {
          ok: okbuttontext,
          cancel: cancelbuttontext
        }
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {

      }
    });
  }

  openAlertDialog(message : string) {
    const dialogRef = this.dialog.open(AlertDialogComponent,{
      data:{
        message: message,
        buttonText: {
          cancel: 'Done'
        }
      },
    });
  }
  //////////////////////////////////

  constructor(private dialog: MatDialog) {
    this.progressData.setValue(this.TestProgressData);
    this.SprintLength.setValue('14');
    this.TeamVelocity.setValue('50');
   }

  ngOnInit(): void {
  }
}
