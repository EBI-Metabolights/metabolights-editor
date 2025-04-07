import { NgModule } from "@angular/core";
import { AuthGuard } from "./auth-guard.service";
import {
  Routes,
  RouterModule,
  UrlSegment,
  UrlMatchResult,
} from "@angular/router";

import { LoginComponent } from "./components/auth/login/login.component";
import { ConsoleComponent } from "./components/console/console.component";

import { StudyComponent } from "./components/study/study.component";

import { PublicStudyComponent } from "./components/public/study/study.component";

import { PageNotFoundComponent } from "./components/shared/errors/page-not-found/page-not-found.component";

import { CreateComponent } from "./components/guide/create/create.component";
import { RawUploadComponent } from "./components/guide/upload/upload.component";
import { InfoComponent } from "./components/guide/info/info.component";
import { MetaComponent } from "./components/guide/meta/meta.component";
import { GuidedAssaysComponent } from "./components/guide/assays/assays.component";
import { GuidesComponent } from "./components/public/guides/guides.component";
import { NoStudyPageComponent } from "./components/shared/errors/no-study-page/no-study-page.component";
import { StudyNotPublicComponent } from "./components/shared/errors/study-not-public/study-not-public.component";
import { DataPolicyComponent } from "./components/public/data-policy/data-policy.component";
import { DatasetLicenseStaticPageComponent } from "./components/public/dataset-license-static/dataset-license-static.component";

/* eslint-disable prefer-arrow/prefer-arrow-functions */
export function reviewerStudyMatcher(url: UrlSegment[]): UrlMatchResult {
  if (url === null || url.length === 0) {
    return null;
  }
  const reg = /reviewer(.*)$/;
  const param = url[0].toString();

  if (param.match(reg)) {
    let data = null;
    if (url[1]) {
      data = { consumed: url, posParams: { study: url[0], tab: url[1] } };
    } else {
      data = { consumed: url, posParams: { study: url[0], tab: "descriptors" } };
    }
    return data;
  }
  return null;
}

/* eslint-disable prefer-arrow/prefer-arrow-functions */
export function publicStudyMatcher(url: UrlSegment[]): UrlMatchResult {
  if (url === null || url.length === 0) {
    return null;
  }
  const reg = /([MTBLS|mtbls])([0-9]+)(.*)$/;
  const param = url[0].toString();

  if (param.match(reg)) {
    let data = null;
    if (url[1]) {
      data = { consumed: url, posParams: { study: url[0], tab: url[1] } };
    } else {
      data = { consumed: url, posParams: { study: url[0], tab: "descriptors" } };
    }
    return data;
  }
  return null;
}

const routes: Routes = [
  { path: "login", canActivate: [AuthGuard], component: LoginComponent },
  { path: "guides", component: GuidesComponent },
  { path: "guides/:tab", component: GuidesComponent },
  { path: "guides/:tab/:section", component: GuidesComponent },
  { path: "datapolicy", component: DataPolicyComponent},
  { path: "license", component: DatasetLicenseStaticPageComponent},

  { path: "", redirectTo: "console", pathMatch: "full" },
  { path: "console", canActivate: [AuthGuard], component: ConsoleComponent },

  {
    path: "guide/create",
    canActivate: [AuthGuard],
    component: CreateComponent,
  },
  {
    path: "guide/info/:id",
    canActivate: [AuthGuard],
    component: InfoComponent,
  },
  {
    path: "guide/upload/:id",
    canActivate: [AuthGuard],
    component: RawUploadComponent,
  },
  {
    path: "guide/meta/:id",
    canActivate: [AuthGuard],
    component: MetaComponent,
  },
  {
    path: "guide/assays/:id",
    canActivate: [AuthGuard],
    component: GuidedAssaysComponent,
  },
  {
    path: "guide/assays/:id/:step",
    canActivate: [AuthGuard],
    component: GuidedAssaysComponent,
  },
  {
    path: "guide/assays/:id/:step/:substep",
    canActivate: [AuthGuard],
    component: GuidedAssaysComponent,
  },

  { path: "study/:id", canActivate: [AuthGuard], component: StudyComponent },
  {
    path: "study/:id/:tab",
    canActivate: [AuthGuard],
    component: StudyComponent,
  },
  { path: "study", redirectTo: "console", pathMatch: "full" },
  { path: "study-not-found", component: NoStudyPageComponent },
  { path: "study-not-public", component: StudyNotPublicComponent},
  { path: "page-not-found", component: PageNotFoundComponent },
  { matcher: publicStudyMatcher, canActivate: [AuthGuard], component: PublicStudyComponent },
  { matcher: reviewerStudyMatcher, canActivate: [AuthGuard], component: PublicStudyComponent },
  { path: "**", component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
