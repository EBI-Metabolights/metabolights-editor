import { Component, OnInit, Input } from '@angular/core';
import { ConfigurationService } from 'src/app/configuration.service';
import { VideoURL } from 'src/environment.interface';

@Component({
  selector: 'mtbls-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  @Input('target') target: string;

  isModalOpen: boolean = false;
  videoLink: string = "201904_ML_ALL.mp4";

  constructor(private configService: ConfigurationService) { }

  ngOnInit() {
    this.videoLink = this.getVideoLink()
  }

  getVideoLink(): string {
    let accessor = this.target as keyof VideoURL
    return this.configService.config.VideoURL[accessor]
  }

  openModal(){
  	this.isModalOpen = true;
  }

  closeModal(){
  	this.isModalOpen = false;
  }
}
