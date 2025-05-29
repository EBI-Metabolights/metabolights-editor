import { Component, inject, OnInit } from "@angular/core";
import { EditorService } from "./../../../services/editor.service";
import { UntypedFormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { ConfigurationService } from "src/app/configuration.service";
import { PlatformLocation } from "@angular/common";
import { Store } from "@ngxs/store";
import { Loading } from "src/app/ngxs-store/non-study/transitions/transitions.actions";
// import { Guides } from "src/app/ngxs-store/non-study/application/application.actions";
import { ApplicationState } from "src/app/ngxs-store/non-study/application/application.state";
import { Observable } from "rxjs";
@Component({
  selector: "app-guides",
  templateUrl: "./guides.component.html",
  styleUrls: ["./guides.component.css"],
})
export class GuidesComponent implements OnInit {

  // IT IS A MAP TO LEGACY DOC PAGE LINKS TO NEW ONE.
  // If new guides pages structure is updated, this map should be reviewed again.
  private guidesMap: { [key: string]: string } = {
    "Quick_start_Guide": "#quick-start-guide",
    "Quick_start_Guide/Quick_start_overview": "#quick-start-guide",
    "Quick_start_Guide/Submission_checklist": "#submission-checklist",
    "Quick_start_Guide/Submission_process": "#submission-process",
    "Quick_start_Guide/Create_study": "#create-study",
    "Quick_start_Guide/Edit_study": "#edit-study",
    "Quick_start_Guide/Shortcuts_functions": "#shortcuts-functions",
    "Quick_start_Guide/Study_overview": "#study-overview",
    "Quick_start_Guide/validation": "#validate-study",
    "Quick_start_Guide/Referencing_a_study": "#referencing-a-study",
    "Quick_start_Guide/Video_tutorial": "Video",
    "MetaboLights_account": "MetaboLights_account/#metabolights-account",
    "MetaboLights_account/create_account": "MetaboLights_account/#create-account",
    "MetaboLights_account/Personal_api_token": "MetaboLights_account/#personal-api-token",
    "MetaboLights_account/account_detail_reset": "MetaboLights_account/#update-login-details",
    "MetaboLights_account/orcid": "MetaboLights_account/#orcid",
    "MetaboLights_account/My_Studies_page": "MetaboLights_account/#my-studies",
    "Study_description": "Study_description/#study-description",
    "Study_description/Study_title": "Study_description/#study-title",
    "Study_description/Authors": "Study_description/#authors",
    "Study_description/Abstract": "Study_description/#abstract",
    "Study_description/Publications": "Study_description/#publications",
    "Study_description/Keywords": "Study_description/#keywords",
    "Protocol": "Protocol/#protocol",
    "Protocol/Protocol": "Protocol/#protocol",
    "Sample": "Sample/#sample",
    "Sample/Sample": "Sample/#sample_1",
    "Sample/Factors": "Sample/#factors",
    "Sample/Editing_sample_information": "Sample/#sample",
    "Assay": "Assay/#assay",
    "Assay/Assay_overview": "Assay/#assay-overview",
    "Assay/NMR_assay": "Assay/#nmr-assay",
    "Assay/LC_MS_assay": "Assay/#lc_ms-assay",
    "Assay/GC_MS_Assay": "Assay/#gc_ms-assay",
    "MAF": "MAF/#maf",
    "MAF/Title": "MAF/#maf_1",
    "Files": "Files/#files",
    "Files/Raw_data": "Files/#raw-data",
    "Files/Upload": "Files/#upload-synchronisation",
    "Files/Download": "Files/#download",
    "FAQs": "FAQs/#faqs",
    "FAQs/Upload_download": "FAQs/#upload-download",
    "FAQs/Files": "FAQs/#files",
    "FAQs/Sample": "FAQs/#sample",
    "FAQs/Assay": "FAQs/#assay",
    "FAQs/MAF": "FAQs/#maf"
  };

  // selectedLanguage$: Observable<string> = inject(Store).select(ApplicationState.selectedLanguage);
  // mappings$: Observable<Record<string, any>> = inject(Store).select(ApplicationState.mappings);
  // guides$: Observable<any> = inject(Store).select(ApplicationState.guides);

  // domain = "";
  // repo = "";
  // tabs: any = [];
  // selectedSection: any = null;
  // selectedTab: any = null;
  // isImageModalOpen = false;

  // languageMappings: any = null;
  // languageSelected: any = null;
  // guidesSelected: any = null;
  // selectedImgURL: string = null;

  // tab: string = null;
  // section: string = null;

  constructor(
    // private fb: UntypedFormBuilder,
    // private store: Store,
    // public router: Router,
    // private editorService: EditorService,
    private route: ActivatedRoute,
    private configService: ConfigurationService,
    // private platformLocation: PlatformLocation
  ) {
  }

  ngOnInit(): void {
    // this.setUpSubscriptionsNgxs();
    let repo = this.configService.config.metabolightsWSURL.guides;
    if (!repo.endsWith("/")) {
      // this.repo =  this.repo.slice(0, -1);
      repo += "/"
    }
    let context = ""
    const tab = this.route.snapshot.paramMap.get("tab");
    if (tab) {
      context = tab + "/"
      const section = this.route.snapshot.paramMap.get("section");
      if (section) {
        context += section + "/"
      }
      context = context.slice(0, -1);
    }

    if (context in this.guidesMap) {
      window.location.href = repo + this.guidesMap[context];
    } else {
      window.location.href = repo
    }
  }

  /**
   * Subscribe to each of the components selectors. Also dispatches a Loading.Disable action to derender the loading view.
   */
  // setUpSubscriptionsNgxs() {
  //   this.store.dispatch(new Loading.Disable());
  //   this.mappings$.subscribe((value) => {
  //     if (value != null) {
  //       this.languageMappings = value;
  //     }
  //   });

  //   this.guides$.subscribe((value) => {
  //     if (value != null) {
  //       this.guidesSelected = value;
  //       this.tabs = Object.keys(this.guidesSelected);
  //       this.tab = this.route.snapshot.paramMap.get("tab");
  //       if (this.tabs.indexOf(this.tab) > -1) {
  //         this.setSelectedTab(this.tab);
  //       } else {
  //         this.setSelectedTab(this.tabs[0]);
  //       }
  //     }
  //   });

  //   this.selectedLanguage$.subscribe((value) => {
  //     if (value != null) {
  //       this.languageSelected = value;
  //     }
  //   });

  // }


  // open(image: string): void {
  //   if (image) {
  //     this.selectedImgURL = image;
  //     this.isImageModalOpen = true;
  //   }
  // }

  // closeImageModal() {
  //   this.selectedImgURL = null;
  //   this.isImageModalOpen = false;
  // }

  // getURL(img) {
  //   if (img) {
  //     if (img.indexOf("ftp://") > -1) {
  //       return img;
  //     }
  //     return this.repo + "/media/images/" + img;
  //   }
  // }

  // selectSection(key) {
  //   if (window.history.replaceState) {
  //     window.history.replaceState(
  //       {},
  //       "MetaboLights Guides",
  //       this.getURLBase("/guides/" + this.selectedTab + "/" + key)
  //     );
  //   }
  //   this.selectedSection = key;
  // }

  // setSelectedTab(tab) {
  //   this.selectedTab = tab;
  //   let url = this.getURLBase("/guides/" + this.selectedTab);
  //   if (this.guidesSelected[tab]) {
  //     this.section = this.route.snapshot.paramMap.get("section");
  //     if (this.getKeys(this.guidesSelected[tab]).indexOf(this.section) > -1) {
  //       this.selectedSection = this.section;
  //     } else {
  //       this.selectedSection = this.getKeys(this.guidesSelected[tab])[0];
  //     }
  //     url = url + "/" + this.selectedSection;
  //   }
  //   if (window.history.replaceState) {
  //     window.history.replaceState({}, "MetaboLights Guides", url);
  //   }
  // }

  // setSelectedLanguage(language) {
  //   this.store.dispatch(new Guides.Get(language, true))
  // }

  // getKeys(object) {
  //   if (object) {
  //     return Object.keys(object);
  //   } else {
  //     return [];
  //   }
  // }

  // getURLBase(url) {
  //   const base = this.platformLocation.getBaseHrefFromDOM();
  //   if(base.endsWith("/")){
  //     return window.location.origin + base.slice(0, -1) + url;
  //   }
  //   return window.location.origin + this.platformLocation.getBaseHrefFromDOM() + url;
  // }
}
