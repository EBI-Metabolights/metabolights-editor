import { Component, ViewEncapsulation, ElementRef, OnInit } from "@angular/core";
import { EditorService } from "./services/editor.service";
import { Subscription } from "rxjs";
import { NavigationStart, Router, RouterEvent } from "@angular/router";
import jwtDecode from "jwt-decode";
import { MtblsJwtPayload } from "./services/headers";
import { Store } from "@ngxs/store";
import { environment } from "src/environments/environment";
import { BackendVersion, EditorVersion } from "./ngxs-store/non-study/application/application.actions";

export let browserRefresh = false;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  subscription: Subscription;
  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private editorService: EditorService,
    private store: Store
  ) {

    this.subscription = router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
  }
  async ngOnInit() {
    const jwt = this.elementRef.nativeElement.getAttribute("mtblsjwt");
    const user = this.elementRef.nativeElement.getAttribute("mtblsuser");

    const isOwner = this.elementRef.nativeElement.getAttribute("isOwner");
    const isCurator = this.elementRef.nativeElement.getAttribute("isCurator");

    const mtblsid = this.elementRef.nativeElement.getAttribute("mtblsid");
    const obfuscationcode =
      this.elementRef.nativeElement.getAttribute("obfuscationcode");
    const result = await this.editorService.updateSession();
    if (result === true){
      const redirectUrl = this.editorService.redirectUrl;
      const url = this.router.routerState.snapshot.url;
      if (url === "/login" ){
        if (redirectUrl !== null && redirectUrl !== "") {
          this.router.navigate([this.editorService.redirectUrl]);
        } else {
          this.router.navigate(["/console"]);
        }
      }
      return;
    }
    if (jwt && jwt !== "" && user && user !== "") {
      localStorage.setItem("mtblsuser", user);
      localStorage.setItem("mtblsjwt", jwt);
    } else if (
      mtblsid &&
      mtblsid !== "" &&
      obfuscationcode &&
      obfuscationcode !== ""
    ) {
      localStorage.setItem("mtblsid", mtblsid);
      localStorage.setItem("obfuscationcode", obfuscationcode);
    } else {
      localStorage.removeItem("mtblsjwt");
      localStorage.removeItem("mtblsuser");
    }
    //  this.store.dispatch(new GuidesMappings.Get()); // to load the guides we first load the mappings
     this.store.dispatch(new BackendVersion.Get());
     this.store.dispatch(new EditorVersion.Get());


  }


}
