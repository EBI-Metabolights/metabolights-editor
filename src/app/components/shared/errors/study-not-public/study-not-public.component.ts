import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { EditorService } from 'src/app/services/editor.service';
import { ErrorMessageService } from 'src/app/services/error-message.service';

@Component({
  selector: 'app-study-not-public',
  standalone: true,
  imports: [],
  templateUrl: './study-not-public.component.html',
  styleUrl: './study-not-public.component.css'
})
export class StudyNotPublicComponent implements OnInit {
  messageHeader = "Study page not found";
  messageContent = "Error while loading study. Possible reasons: 1) Study accesion number is not valid or it is not public or editable.";
  messageExpanded = true;
  study: string = ""
  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private errorMessageService: ErrorMessageService,
    private editorService: EditorService
) {}
  toggleMessage() {
    this.messageExpanded = !this.messageExpanded;
  }
  ngOnInit() {
    
    this.store.dispatch(new Loading.Disable())
     
      this.route.queryParams.subscribe((params) => {
        const errorCode = params.code ?? "";

        //const message = this.errorMessageService.getErrorMessage(errorCode);
       // const header = message?.header ?? "Study page not found";
        //const content = message?.content ?? "Error while loading study.";
        const url = this.editorService.redirectUrl ?? "";
        //console.dir(this.route);
        if (url !== "" ) {
          const path = url.split("?")[0].replace("/", "");
          if(!path.includes('MTBLS')) {
            console.log('routing to login from study not public component: }' + path)
            this.router.navigate(['login']); 
          } //safeguard in case we somehow arrived here by some manual way
          this.study = path;
        } else {
        }
        this.messageHeader = "";
      });
  }

}
