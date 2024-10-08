import { Component, inject, OnInit } from "@angular/core";
import { EditorService } from "./../../../services/editor.service";
import { UntypedFormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
import { Guides } from "src/app/ngxs-store/non-study/application/application.actions";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Observable } from "rxjs";
@Component({
  selector: "app-guides",
  templateUrl: "./guides.component.html",
  styleUrls: ["./guides.component.css"],
})
export class GuidesComponent implements OnInit {

  selectedLanguage$: Observable<string> = inject(Store).select(ApplicationState.selectedLanguage);
  mappings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.mappings);
  guides$: Observable<any> = inject(Store).select(ApplicationState.guides);

  domain = "";
  repo = "";
  tabs: any = [];
  selectedSection: any = null;
  selectedTab: any = null;
  isImageModalOpen = false;

  languageMappings: any = null;
  languageSelected: any = null;
  guidesSelected: any = null;
  selectedImgURL: string = null;

  tab: string = null;
  section: string = null;

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store,
    public router: Router,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private configService: ConfigurationService,
    private platformLocation: PlatformLocation
  ) {
  }

  ngOnInit(): void {
    this.setUpSubscriptionsNgxs();
    this.repo = this.configService.config.metabolightsWSURL.guides;
    if(this.repo.endsWith("/")){
      this.repo =  this.repo.slice(0, -1);
    }
  }

  /**
   * Subscribe to each of the components selectors. Also dispatches a Loading.Disable action to derender the loading view.
   */
  setUpSubscriptionsNgxs() {
    this.store.dispatch(new Loading.Disable());
    this.mappings$.subscribe((value) => {
      if (value != null) {
        this.languageMappings = value;
      }
    });

    this.guides$.subscribe((value) => {
      if (value != null) {
        this.guidesSelected = value;
        this.tabs = Object.keys(this.guidesSelected);
        this.tab = this.route.snapshot.paramMap.get("tab");
        if (this.tabs.indexOf(this.tab) > -1) {
          this.setSelectedTab(this.tab);
        } else {
          this.setSelectedTab(this.tabs[0]);
        }
      }
    });

    this.selectedLanguage$.subscribe((value) => {
      if (value != null) {
        this.languageSelected = value;
      }
    });
    
  }


  open(image: string): void {
    if (image) {
      this.selectedImgURL = image;
      this.isImageModalOpen = true;
    }
  }

  closeImageModal() {
    this.selectedImgURL = null;
    this.isImageModalOpen = false;
  }

  getURL(img) {
    if (img) {
      if (img.indexOf("ftp://") > -1) {
        return img;
      }
      return this.repo + "/media/images/" + img;
    }
  }

  selectSection(key) {
    if (window.history.replaceState) {
      window.history.replaceState(
        {},
        "MetaboLights Guides",
        this.getURLBase("/guides/" + this.selectedTab + "/" + key)
      );
    }
    this.selectedSection = key;
  }

  setSelectedTab(tab) {
    this.selectedTab = tab;
    let url = this.getURLBase("/guides/" + this.selectedTab);
    if (this.guidesSelected[tab]) {
      this.section = this.route.snapshot.paramMap.get("section");
      if (this.getKeys(this.guidesSelected[tab]).indexOf(this.section) > -1) {
        this.selectedSection = this.section;
      } else {
        this.selectedSection = this.getKeys(this.guidesSelected[tab])[0];
      }
      url = url + "/" + this.selectedSection;
    }
    if (window.history.replaceState) {
      window.history.replaceState({}, "MetaboLights Guides", url);
    }
  }

  setSelectedLanguage(language) {
    this.store.dispatch(new Guides.Get(language, true))
  }

  getKeys(object) {
    if (object) {
      return Object.keys(object);
    } else {
      return [];
    }
  }

  getURLBase(url) {
    const base = this.platformLocation.getBaseHrefFromDOM();
    if(base.endsWith("/")){
      return window.location.origin + base.slice(0, -1) + url;
    }
    return window.location.origin + this.platformLocation.getBaseHrefFromDOM() + url;
  }
}
