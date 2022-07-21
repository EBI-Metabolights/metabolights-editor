import { Component, OnInit } from '@angular/core';
import { EditorService } from '../../../services/editor.service';
import { Router } from "@angular/router";
import { IAppState } from '../../../store';
import { NgRedux, select } from '@angular-redux/store';
import { ActivatedRoute } from "@angular/router";
import { MetaboLightsWSURL } from './../../../services/globals';
import { HttpClient } from '@angular/common/http';
import { LabsWorkspaceService } from 'src/app/services/labs-workspace.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css']
})
export class PublicStudyComponent implements OnInit {
  
  @select(state => state.study.identifier) studyIdentifier;
  @select(state => state.status.user) user;
  @select(state => state.study.status) studyStatus;
  @select(state => state.study.validation) studyValidation;
  @select(state => state.status.currentTabIndex) currentIndex: number;
  @select(state => state.study.investigationFailed) investigationFailed;
  @select(state => state.study.files) studyFiles;
  @select(state => state.status.userStudies) userStudies;
  @select(state => state.study.reviewerLink) studyReviewerLink;

  loading: any = true;
  requestedTab: number = 0;
  status: string = "submitted";
  tab: string = "descriptors";
  requestedStudy: string = null;
  studyError: boolean = false;
  validation: any = {};
  files: any = null;
  currentUser: any = null;
  isOwner: any = false;
  isCurator: any = false;
  domain: string = "";
  reviewerLink: string = null;

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private editorService: EditorService, 
    private router: Router, 
    private route: ActivatedRoute,
    private labsWorkspaceService: LabsWorkspaceService
    ) { 
    let isInitialised
    if (!environment.isTesting) {
      isInitialised = this.ngRedux.getState().status['isInitialised'];
    } 
    let ObfuscationCode = localStorage.getItem('obfuscationcode')
    let owner = localStorage.getItem('isOwner');
    if(owner && owner != null && owner != ''){
      this.isOwner = JSON.parse(owner.toLowerCase());
    }

    let curator = localStorage.getItem('isCurator');
    if(curator && curator != null && curator != ''){
      this.isCurator = JSON.parse(curator.toLowerCase());
    }

    if(ObfuscationCode){
      ObfuscationCode = ObfuscationCode.replace("reviewer",'');
      let studyID = localStorage.getItem('mtblsid');
      if(!isInitialised){
        this.editorService.initialise('{"apiToken":"ocode:' + ObfuscationCode + '"}', false);
        if (!environment.isTesting) {
          this.loadStudy(studyID);
        }
          
      }
    }else{
      if(!isInitialised){
        let mtblsUser = localStorage.getItem('mtblsuser');
        let mtblsJWT = localStorage.getItem('mtblsjwt');
        if(mtblsJWT && mtblsJWT != '' && mtblsUser && mtblsUser != ''){
          this.labsWorkspaceService.initialise({ "jwt" : mtblsJWT, "user" : mtblsUser }).subscribe( res => {
            localStorage.setItem('user', JSON.stringify(res.owner));
            let localUser = localStorage.getItem('user');
            this.editorService.initialise(localUser, false);
            if (!environment.isTesting) {
              this.loadStudy(null);
            }
          });
        }else{
          localStorage.removeItem('user');
          if (!environment.isTesting) {
            this.loadStudy(null);
          }
        }
      }
    }
  }

  ngOnInit(){
    this.domain = MetaboLightsWSURL['domain']
  }

  loadStudy(studyId){
    this.editorService.toggleLoading(false)
    if(studyId){
      this.editorService.loadStudyInReview(studyId)
    }else{
      this.editorService.loadPublicStudy({
        id: this.route.snapshot.paramMap.get("study")
      })
    }
    this.studyIdentifier.subscribe(value => { 
        if(value != null){
            this.requestedStudy = value
        }
    });

    this.studyValidation.subscribe(value => {
      this.validation = value
    })
    
    this.studyFiles.subscribe(value => { 
        this.files = value;
        this.loading = false;
        if(this.isCurator || this.isOwner){
          this.editorService.validateStudy();
        }
    });
    
    this.investigationFailed.subscribe(value => {
        this.studyError = value
    })

    this.studyStatus.subscribe(value => {
      this.status = value
    })

    this.studyReviewerLink.subscribe(value => {
      this.reviewerLink = value
    })

    this.route.params.subscribe( params => {
        if(params['tab'] == 'files'){
            this.requestedTab = 5
            this.tab = "files";
        }else if(params['tab'] == 'metabolites'){
            this.requestedTab = 4
            this.tab = "metabolites";
        }else if(params['tab'] == 'assays'){
            this.requestedTab = 3
            this.tab = "assays";
        }else if(params['tab'] == 'samples'){
            this.requestedTab = 2
            this.tab = "samples";
        }else if(params['tab'] == 'protocols'){
            this.requestedTab = 1
            this.tab = "protocols";
        }else if(params['tab'] == 'validations'){
            this.requestedTab = 6
            this.tab = "validations";
        }else{
            this.requestedTab = 0
            this.tab = "descriptors";
        }
    });
    this.selectCurrentTab(this.requestedTab, this.tab)
  }

  selectCurrentTab(index, tab){
    this.ngRedux.dispatch({ type: 'SET_TAB_INDEX', body: {
        'currentTabIndex': index
    }})
    let urlSplit = window.location.pathname.replace(/\/$/, "").split("/").filter(n => n);
    if(urlSplit.length >= 2){
        if(urlSplit[urlSplit.length - 1].indexOf("MTBLS") < 0){
            urlSplit.pop();
        }
    }
    window.history.pushState("", "", window.location.origin + "/" + urlSplit.join("/") + "/" + tab);
    if(index == 6){
        this.editorService.validateStudy();
        document.getElementById("tab-content-wrapper").scrollIntoView();
    }
  }

  isJSON(data) {
    var ret = true;
    try {
       JSON.parse(data);
    }catch(e) {
       ret = false;
    }
    return ret;
  }
}
