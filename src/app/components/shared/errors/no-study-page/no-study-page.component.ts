import { Component, OnInit } from '@angular/core';
import { NgRedux, select } from "@angular-redux/store";
import { IAppState } from "./../../../../store";
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessageService } from 'src/app/services/error-message.service';
import { EditorService } from 'src/app/services/editor.service';
import { environment } from 'src/environments/environment';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-no-study-page',
  templateUrl: './no-study-page.component.html',
  styleUrls: ['./no-study-page.component.css']
})
export class NoStudyPageComponent implements OnInit {
  messageHeader = "Study page not found";
  messageContent = "Error while loading study. Possible reasons: 1) Study accesion number is not valid or it is not public or editable.";
  messageExpanded = true;
  constructor(private ngRedux: NgRedux<IAppState>,
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
    if (environment.useNewState) {
      this.store.dispatch(new Loading.Disable())
    } else {
      if (!environment.isTesting) {
        this.ngRedux.dispatch({ type: "DISABLE_LOADING" });
      }
    }
      this.route.queryParams.subscribe((params) => {
        const errorCode = params.code ?? "";

        const message = this.errorMessageService.getErrorMessage(errorCode);
        const header = message?.header ?? "Study page not found";
        const content = message?.content ?? "Error while loading study.";
        const url = this.editorService.redirectUrl ?? "";
        if (url !== "") {
          const path = url.split("?")[0];
          this.messageContent = "URL: " + path + " . " + content;
        } else {
          this.messageContent = content;
        }
        this.messageHeader = header;
      });
  }

}
