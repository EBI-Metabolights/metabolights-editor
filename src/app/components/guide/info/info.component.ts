import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { DOIService } from '../../../services/publications/doi.service';
import { EuropePMCService } from '../../../services/publications/europePMC.service';
import { MetabolightsService } from '../../../services/metabolights/metabolights.service';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../../store';
import { MTBLSPerson } from './../../../models/mtbl/mtbls/mtbls-person';
import { Ontology } from './../../../models/mtbl/mtbls/common/mtbls-ontology';
import { MTBLSPublication } from './../../../models/mtbl/mtbls/mtbls-publication';
import {JsonConvert, OperationMode, ValueCheckingMode} from "json2typescript";
import { EditorService } from './../../../services/editor.service';
import * as toastr from 'toastr';
import {Router} from "@angular/router";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

  @select(state => state.study.identifier) studyIdentifier; 

  user: any = null;
  requestedStudy: string = null;
  uploadFiles: any[] = [];
  isLoading: boolean = false;

  constructor(private ngRedux: NgRedux<IAppState>, private router: Router, private route: ActivatedRoute,  private editorService: EditorService) { 
    this.editorService.initialiseStudy(this.route)
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
  }

  setUpSubscriptions() {
    this.studyIdentifier.subscribe(value => { 
      if(value != null){
        this.requestedStudy = value
      }
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  proceedToNextStep() {
    this.router.navigate(['/guide/upload', this.requestedStudy])
  }
}
