import { PlatformLocation } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfigurationService } from 'src/app/configuration.service';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { EditorService } from 'src/app/services/editor.service';
import { ErrorMessageService } from 'src/app/services/error-message.service';

@Component({
    selector: 'app-study-not-public',
    imports: [],
    templateUrl: './study-not-public.component.html',
    styleUrl: './study-not-public.component.css'
})
export class StudyNotPublicComponent implements OnInit {
  study: string = ""
  metabolightsWebsiteUrl = ""

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private editorService: EditorService,
    private configService: ConfigurationService) {
      const url = this.configService.config.endpoint;
      if(url.endsWith("/")){
        this.metabolightsWebsiteUrl = url.slice(0, -1);
      } else {
        this.metabolightsWebsiteUrl = url;
      }
}

  ngOnInit() {
    
    this.store.dispatch(new Loading.Disable())

      this.route.queryParams.subscribe((params) => {
        this.study = params.studyIdentifier;
        const url = this.editorService.redirectUrl ?? "";
      });
  }

  login(){
    this.router.navigate(['login']);
  }

  homePage(){
    window.location.href = this.metabolightsWebsiteUrl
  }

}
