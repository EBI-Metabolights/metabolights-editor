import { IAppState } from "./../../../store";
import { Component, OnInit } from "@angular/core";
import { EditorService } from "./../../../services/editor.service";
import { FormBuilder } from "@angular/forms";
import { NgRedux, select } from "@angular-redux/store";
import { Router } from "@angular/router";
import { MetaboLightsWSURL } from "./../../../services/globals";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";
import { ConfigurationService } from "src/app/configuration.service";

@Component({
  selector: "app-guides",
  templateUrl: "./guides.component.html",
  styleUrls: ["./guides.component.css"],
})
export class GuidesComponent implements OnInit {
  @select((state) => state.status.mappings) mappings;
  @select((state) => state.status.guides) guides;
  @select((state) => state.status.selectedLanguage) selectedLanguage;

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
    private fb: FormBuilder,
    private ngRedux: NgRedux<IAppState>,
    public router: Router,
    private editorService: EditorService,
    private route: ActivatedRoute,
    private configService: ConfigurationService
  ) {}

  ngOnInit(): void {
    if (!environment.isTesting) {
      this.setUpSubscriptions();
    }
    this.domain = this.configService.config.metabolightsWSURL.domain;
    this.repo = this.configService.config.metabolightsWSURL.guides;
  }

  setUpSubscriptions() {
    this.ngRedux.dispatch({ type: "DISABLE_LOADING" });

    this.mappings.subscribe((value) => {
      if (value != null) {
        this.languageMappings = value;
      }
    });

    this.guides.subscribe((value) => {
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

    this.selectedLanguage.subscribe((value) => {
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
      return this.repo + "media/images/" + img;
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
    this.editorService.loadLanguage(language);
  }

  getKeys(object) {
    if (object) {
      return Object.keys(object);
    } else {
      return [];
    }
  }

  getURLBase(url) {
    return "/metabolights/editor" + url;
  }
}
