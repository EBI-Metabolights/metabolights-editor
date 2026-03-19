import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfigurationService } from 'src/app/configuration.service';
import { Loading } from 'src/app/ngxs-store/non-study/transitions/transitions.actions';
import { EditorService } from 'src/app/services/editor.service';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';

@Component({
    selector: 'app-study-not-completed',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './study-not-completed.component.html',
    styleUrl: './study-not-completed.component.css'
})
export class StudyNotCompletedComponent implements OnInit {
    study: string = ""
    metabolightsWebsiteUrl = ""
    isAuthenticated = false;
    isAccessioned = false;
    isOwner = false;

    constructor(
        private store: Store,
        private route: ActivatedRoute,
        private router: Router,
        private editorService: EditorService,
        private configService: ConfigurationService,
        private keycloak: KeycloakService) {
        const url = this.configService.config.endpoint;
        if (url.endsWith("/")) {
            this.metabolightsWebsiteUrl = url.slice(0, -1);
        } else {
            this.metabolightsWebsiteUrl = url;
        }
    }

    async ngOnInit() {
        this.store.dispatch(new Loading.Disable())
        this.isAuthenticated = await this.keycloak.isLoggedIn();
        this.route.queryParams.subscribe((params) => {
            this.study = params.studyIdentifier;
            this.isAccessioned = params.isAccessioned === 'true';
            this.isOwner = params.isOwner === 'true' || params.isOwner === true;
        });
    }

    homePage() {
        window.location.href = this.metabolightsWebsiteUrl
    }

    backToConsole() {
        this.router.navigate(['/console']);
    }

    login() {
        this.keycloak.login();
    }
}
