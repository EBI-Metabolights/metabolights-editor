import { Router, ActivatedRoute } from '@angular/router';
import { IAppState } from './../../store';
import { NgRedux, select } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { EditorService } from '../../services/editor.service';

@Component({
	selector: 'mtbls-console',
	templateUrl: './console.component.html',
	styleUrls: ['./console.component.css']
})
export class ConsoleComponent implements OnInit{

    @select(state => state.status.isCurator) isCurator;
    @select(state => state.status.userStudies) userStudies;

    studies: string[] = []
    filteredStudies: string[] = []
    loadingStudies: boolean = false;
    filterValue: string = null;
    messageExpanded: boolean = false;

    submittedStudies: any = [];

    isConfirmationModalOpen: boolean = false;

    constructor(private route: ActivatedRoute, public router: Router, public http: Http, private ngRedux: NgRedux<IAppState>, private editorService: EditorService) {
        this.route.queryParams.subscribe(params => {
            if(params['reload']){
                this.editorService.getAllStudies() 
            }
        });
    }

    ngOnInit() {
    }

    toggleMessage(){
        this.messageExpanded = !this.messageExpanded
    }

    createNewStudy(){
        this.submittedStudies = this.studies.filter(study => study['status'] == 'Submitted')
        if(this.submittedStudies.length > 0){
            this.isConfirmationModalOpen = true
        }else{
            this.router.navigate(['/guide/create']);
        }
    }

    closeConfirmation(){
        this.isConfirmationModalOpen = false   
    }

    ngAfterContentInit() {
        this.editorService.initialiseStudy(null)
        this.userStudies.subscribe(value => { 
            if(value == null){
                this.ngRedux.dispatch({ type: 'SET_LOADING_INFO', body: {
                  'info': 'Loading user studies' 
                }})
                this.editorService.getAllStudies()
            }else{
                this.editorService.toggleLoading(false);
                this.studies = value
                this.studies.sort(function(a,b){
                    return (+new Date(b['releaseDate'])) - (+new Date(a['releaseDate']))
            })
            this.filteredStudies = this.studies;
            this.loadingStudies = false;
            }
        });
    }

    formatDate(date){
        return date
    }

    filterStudies(value){
        this.filterValue = value
        if(value != null){
            this.filteredStudies = this.studies.filter( s => { return s['status'].toLowerCase() == value.toLowerCase() })
        }else{
            this.filteredStudies = this.studies
        }
        this.filteredStudies = this.filteredStudies.sort(function(a:any ,b: any){ return 0})
    }

    applyFilter(value){
        if(value != ''){
            this.filteredStudies = this.studies.filter( s => {
                if(value != ''){
                    return this.getString(s).toLowerCase().indexOf(value.toLowerCase()) != -1;             
                }else{
                    return true;
                }
            })
        }
    }

    getString(s){
        return s.accession + ' ' + s.title + ' ' + s.description 
    }
}
