import {Component, OnInit, Input, Inject} from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'mtbls-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  @Input('target') target: string;

  isModalOpen: boolean = false;
  videoLink: string = '201904_ML_ALL.mp4';
  videoBaseURL: string;

  constructor() { }

  ngOnInit() {
    this.videoBaseURL = environment.videoBaseURL;
    switch (this.target) {
      case 'aspera':
        this.videoLink = '201904_ML_Aspera.mp4'
        break;

      case 'create_account':
        this.videoLink = '201904_ML_create-acc.mp4'
        break;

      case 'create_study':
        this.videoLink = '201904_ML_create-study.mp4'
        break;

      case 'maf':
        this.videoLink = '201904_ML_MAF.mp4'
        break;

      case 'factors':
        this.videoLink = '201904_ML_factors.mp4'
        break;

      case 'create_assay':
        this.videoLink = '201904_ML_new-assay.mp4'
        break;

      case 'protocols':
        this.videoLink = '201904_ML_protocols.mp4'
        break;

      case 'samples':
        this.videoLink = '201904_ML_samples.mp4'
        break;

      case 'descriptors':
        this.videoLink = '201904_ML_study-description.mp4'
        break;

      case 'editor':
        this.videoLink = '201904_ML_Editor.mp4'
        break;

      default:
        console.error('invalid video link option')
        break;
    }
  }

  openModal(){
  	this.isModalOpen = true;
  }

  closeModal(){
  	this.isModalOpen = false;
  }
}
