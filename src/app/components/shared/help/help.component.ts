import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mtbls-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  @Input('target') target: string;

  isModalOpen: boolean = false;
  videoLink: string = "201904_ML_ALL.mp4";

  constructor() { }

  ngOnInit() {
    if(this.target == 'aspera'){
      this.videoLink = '201904_ML_Aspera.mp4' 
    }else if(this.target == 'create_account'){
      this.videoLink = '201904_ML_create-acc.mp4'
    }else if(this.target == 'create_study'){
      this.videoLink = '201904_ML_create-study.mp4'
    }else if(this.target == 'maf'){
      this.videoLink = '201904_ML_MAF.mp4'
    }else if(this.target == 'factors'){
      this.videoLink = '201904_ML_factors.mp4'
    }else if(this.target == 'create_assay'){
      this.videoLink = '201904_ML_new-assay.mp4'
    }else if(this.target == 'protocols'){
      this.videoLink = '201904_ML_protocols.mp4'
    }else if(this.target == 'samples'){
      this.videoLink = '201904_ML_samples.mp4'
    }else if(this.target == 'descriptors'){
      this.videoLink = '201904_ML_study-description.mp4'
    }else if(this.target == 'editor'){
      this.videoLink = '201904_ML_Editor.mp4'
    }
  }

  openModal(){
  	this.isModalOpen = true;
  }

  closeModal(){
  	this.isModalOpen = false;
  }
}
