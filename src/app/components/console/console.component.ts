import { Router } from '@angular/router';
import { IAppState } from './../../store';
import { NgRedux, select } from '@angular-redux/store';
import { Component, OnInit } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { contentHeaders } from './../../services/headers';
import { AuthenticationURL } from './../../services/globals';
import { AuthService } from '../../services/metabolights/auth.service';
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

    constructor(public router: Router, public http: Http, private ngRedux: NgRedux<IAppState>, private editorService: EditorService) {}

    ngOnInit() {
    }

    ngAfterContentInit() {
        this.userStudies.subscribe(value => { 
          if(value == null){
            this.editorService.getAllStudies()
          }else{
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
