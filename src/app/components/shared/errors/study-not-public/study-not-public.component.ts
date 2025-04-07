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
  study: string = ""
  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private editorService: EditorService
) {}

  ngOnInit() {
    
    this.store.dispatch(new Loading.Disable())
     
      this.route.queryParams.subscribe((params) => {

        const url = this.editorService.redirectUrl ?? "";
        if (url !== "" ) {
          const path = url.split("?")[0].replace("/", "");
          if(!path.includes('MTBLS')) {
            this.router.navigate(['login']); 
          } //safeguard in case we somehow arrived here by some manual way
          this.study = path;
        } else {
        }
      });
  }

}
