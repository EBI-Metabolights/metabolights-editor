import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfigurationService } from 'src/app/configuration.service';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { EditorService } from 'src/app/services/editor.service';

@Component({
    selector: 'app-study-not-completed',
    standalone: true,
    imports: [],
    templateUrl: './study-not-completed.component.html',
    styleUrl: './study-not-completed.component.css'
})
export class StudyNotCompletedComponent implements OnInit {
    study: string = ""
    metabolightsWebsiteUrl = ""

    constructor(
        private store: Store,
        private route: ActivatedRoute,
        private router: Router,
        private editorService: EditorService,
        private configService: ConfigurationService) {
        const url = this.configService.config.endpoint;
        if (url.endsWith("/")) {
            this.metabolightsWebsiteUrl = url.slice(0, -1);
        } else {
            this.metabolightsWebsiteUrl = url;
        }
    }

    ngOnInit() {
        this.store.dispatch(new Loading.Disable())
        this.route.queryParams.subscribe((params) => {
            this.study = params.studyIdentifier;
        });
    }

    homePage() {
        window.location.href = this.metabolightsWebsiteUrl
    }

    backToConsole() {
        this.router.navigate(['/console']);
    }
}
