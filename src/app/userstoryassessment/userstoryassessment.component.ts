import { Component, OnInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder} from '@angular/forms';
import { UserStory } from '../UserStory';



@Component({
  selector: 'app-userstoryassessment',
  templateUrl: './userstoryassessment.component.html',
  styleUrls: ['./userstoryassessment.component.css']
})
export class UserstoryassessmentComponent implements OnInit {
  us_assessment: UserStory = {
    score : 0,
    splittable : 0,
    demonstratable : 0,
    acceptancecriteria : 0,
    collateralmaterials : 0,
    storysize : 0
  };
  tmpScore : number;
  CalculateUserStoryScore()
  {
    this.tmpScore = 0; //reset score
    this.us_assessment.splittable = 0;
    this.us_assessment.demonstratable = 0;
    this.us_assessment.acceptancecriteria = 0;
    this.us_assessment.collateralmaterials = 0;
    this.us_assessment.storysize = 0;
    //demonstrable
    if (this.selectedDemonstrableOption == 1)
    {
      this.us_assessment.demonstratable = 10.0;
    }
    else
    {
      this.us_assessment.demonstratable = 0;
    }

    this.tmpScore += this.us_assessment.demonstratable;
    //Acceptance criteria
    if (this.selectedAcceptanceCriteriaOption == 1)
    {
      this.us_assessment.acceptancecriteria = 20.0;
    }
    else
    {
      this.us_assessment.acceptancecriteria = 0;
    }
    this.tmpScore += this.us_assessment.acceptancecriteria;
    //collateral materials
    if (this.selectedCollateralMaterialsOption == 0)
    {
      this.us_assessment.collateralmaterials = 0;
    }
    else
    {
      if (this.selectedCollateralMaterialsOption == 1)
        this.us_assessment.collateralmaterials = 25.0 / 2.0 * 1;
      else
        if (this.selectedCollateralMaterialsOption == 2)
          this.us_assessment.collateralmaterials = 25.0 / 2.0 * 2;
    }
    this.tmpScore += this.us_assessment.collateralmaterials;
    //estimable
    if (this.selectedStorySizingOption == 0)
    {
      this.us_assessment.storysize = 0;
    }
    else
    {
      if (this.selectedStorySizingOption == 1)
        this.us_assessment.storysize = 20.0 / 2.0 * 1;
      else
      if (this.selectedStorySizingOption == 2) 
        this.us_assessment.storysize = 20.0 / 2.0 * 2;
    }
    this.tmpScore += this.us_assessment.storysize;
    //splittable
    if (this.selectedSplittableOption == 1)
    {
      this.us_assessment.splittable = 25.0;
    }
    else
    {
      this.us_assessment.splittable = 0;
    }
    this.tmpScore += this.us_assessment.splittable;
    this.us_assessment.score = Math.round(this.tmpScore);


    return this.us_assessment.score;
  }


  //processing form changes

  //demonstrable
  selectedDemonstrableOption: number;
  demonstrableOptions = [
    {value: '0', viewValue: 'Not demonstrable'},
    {value: '1', viewValue: 'Demonstrable'}
  ];
  onDemonstrableSelectionChanged() {
    //alert('Select2 ' + this.selectedDemonstrableOption);
    this.CalculateUserStoryScore();
  }
  //acceptance criteria
  selectedAcceptanceCriteriaOption: number;
  acceptanceCriteriaOptions = [
    {value: '0', viewValue: 'Absent'},
    {value: '1', viewValue: 'Present'}
  ];
  onAcceptanceCriteriaSelectionChanged() {
    //alert('Select2 ' + this.selectedAcceptanceCriteriaOption);
    this.CalculateUserStoryScore();
  }
  //collateralMaterials
  selectedCollateralMaterialsOption: number;
  collateralMaterialsOptions = [
    {value: '0', viewValue: 'Not available'},
    {value: '1', viewValue: 'Will be provided in Sprint'},
    {value: '2', viewValue: 'Available'}
  ];
  onCollateralMaterialsSelectionChanged() {
    //alert('Select2 ' + this.selectedCollateralMaterialsOption);
    this.CalculateUserStoryScore();
  }
  //storySizing
  selectedStorySizingOption: number;
  storySizingOptions = [
    {value: '0', viewValue: 'Team is not able to estimate (21)'},
    {value: '1', viewValue: 'Large story (8-13 story points)'},
    {value: '2', viewValue: 'Regular story (1-5 story points)'}
  ];
  onStorySizingSelectionChanged() {
    //alert('Select2 ' + this.selectedStorySizingOption);
    this.CalculateUserStoryScore();
  }
  //splittable
  selectedSplittableOption: number;
  splittableOptions = [
    {value: '0', viewValue: 'Not enough information'},
    {value: '1', viewValue: 'Can be splitted'}
  ];
  onSplittableSelectionChanged() {
    //alert('Select2 ' + this.selectedSplittableOption);
    this.CalculateUserStoryScore();
  }
//////////////////////////////////////////////////
  constructor() {}
  ngOnInit(): void {
  } 
}
