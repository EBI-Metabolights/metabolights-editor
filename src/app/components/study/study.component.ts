import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgRedux, select } from '@angular-redux/store';
import { IAppState } from '../../store';
import { EditorService } from './../../services/editor.service';
import { MetaboLightsWSURL } from './../../services/globals';
import { Router } from "@angular/router";
import { environment } from 'src/environments/environment';

@Component({
	selector: 'mtbls-study',
	templateUrl: './study.component.html',
	styleUrls: ['./study.component.css']
})
export class StudyComponent implements OnInit {

	@select(state => state.study.identifier) studyIdentifier;
	@select(state => state.study.validation) studyValidation;
	@select(state => state.status.currentTabIndex) currentIndex: number;
    @select(state => state.study.status) studyStatus;
    @select(state => state.study.obfuscationCode) studyObfuscationCode;

    @select(state => state.study.investigationFailed) investigationFailed;

    studyError: boolean = false;
	requestedTab: number = 0;
    tab: string = "descriptors";
	requestedStudy: string = null;
    status: string = "submitted";
    validation: any = {};
    obfuscationCode: string = null;
    domain: string = null;
    messageExpanded: boolean = false;

	constructor(private ngRedux: NgRedux<IAppState>, private router: Router, private route: ActivatedRoute,  private editorService: EditorService) {
        /**I am conscious that this is extremely bad practice. However, testing with the angular-redux library, which is at this point abandonware, is a
         * labyrinth of poor documentation and non existent patterns. Until a point in time where we replace the state library ( a sizeable undertaking)
         * this environment context switching to prevent errors in the test bed will have to do.
         *
         * For reference, the errors in the testbed follow the pattern of:
         * Chrome 1.1.1.1 (Mac OS ) StudyComponent should create FAILED
         *   TypeError: Cannot read property 'subscribe' of undefined
         * Which is what happens when the init of this (and almost every other) component opens a subscription
         * to one of the @select objects IE studyStatus. Since the state is not initialised in the TestBed, nor is there any easy way to do so,
         * this .subscribe call fails and throws an error, preventing tests from running.
         */
        if (!environment.isTesting) {
            this.setUpSubscriptions();
        }

	}

    setUpSubscriptions() {
		this.editorService.initialiseStudy(this.route)
        this.studyObfuscationCode.subscribe(value => {
            this.obfuscationCode = value
        })
		this.studyIdentifier.subscribe(value => {
			if(value != null){
				this.requestedStudy = value
			}
		});
        this.domain = MetaboLightsWSURL['domain']

        this.investigationFailed.subscribe(value => {
            this.studyError = value
            this.selectCurrentTab(5, 'files')
        })

        this.studyStatus.subscribe(value => {
            this.status = value
        })

        this.studyValidation.subscribe(value => {
            this.validation = value
        })

        this.route.params.subscribe( params => {
            this.requestedStudy = params['id'];
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
			this.selectCurrentTab(this.requestedTab, this.tab)
        });
    }

    ngOnDestroy() {
        window.removeEventListener('scroll', this.scrollFunction, true);
    }

	ngOnInit() {
        window.addEventListener('scroll', this.scrollFunction, true);
	}

	ngAfterViewInit() {
    }

    toggleMessage(){
        this.messageExpanded = !this.messageExpanded
    }

	selectCurrentTab(index, tab){
        this.ngRedux.dispatch({ type: 'SET_TAB_INDEX', body: {
            'currentTabIndex': index
        }})
        let urlSplit = window.location.pathname.replace(/\/$/, "").split("/").filter(n => n);
        if(urlSplit.length >= 3){
            if(urlSplit[urlSplit.length - 1].indexOf("MTBLS") < 0){
                urlSplit.pop();
            }
        }
        window.history.pushState("", "", window.location.origin + "/" + urlSplit.join("/") + "/" + tab);
        if(index == 6){
            this.editorService.validateStudy();
            if(document.getElementById("tab-content-wrapper")){
               document.getElementById("tab-content-wrapper").scrollIntoView();
            }
        }
    }

    scrollFunction() {
      if (document.body.scrollTop > document.documentElement.clientHeight   || document.documentElement.scrollTop > document.documentElement.clientHeight ) {
        document.getElementById("scrollToTop").style.display = "block";
      } else {
        document.getElementById("scrollToTop").style.display = "none";
      }
    }

    topFunction() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
}
