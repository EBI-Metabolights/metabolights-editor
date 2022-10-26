import { NgModule } from '@angular/core';
import { AuthGuard } from './auth-guard.service';
import {
  Routes,
  RouterModule,
  UrlSegment,
  UrlMatchResult,
} from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { ConsoleComponent } from './components/console/console.component';

import { StudyComponent } from './components/study/study.component';

import { PublicStudyComponent } from './components/public/study/study.component';

import { PageNotFoundComponent } from './components/shared/errors/page-not-found/page-not-found.component';

import { CreateComponent } from './components/guide/create/create.component';
import { RawUploadComponent } from './components/guide/upload/upload.component';
import { InfoComponent } from './components/guide/info/info.component';
import { MetaComponent } from './components/guide/meta/meta.component';
import { GuidedAssaysComponent } from './components/guide/assays/assays.component';
import { GuidesComponent } from './components/public/guides/guides.component';

/* eslint-disable prefer-arrow/prefer-arrow-functions */
export function studyMatcher(url: UrlSegment[]): UrlMatchResult {
  if (url.length === 0) {
    return null;
  }
  const reg = /([MTBLS|mtbls]{5})([0-9]+)$/;
  const param = url[0].toString();

  if (param.match(reg)) {
    let data = null;
    if (url[1]) {
      data = { consumed: url, posParams: { study: url[0], tab: url[1] } };
    } else {
      data = { consumed: url, posParams: { study: url[0] } };
    }
    localStorage.removeItem('mtblsid');
    localStorage.removeItem('obfuscationcode');
    return data;
  } else if (param.match(/([reviewer]{8})/)) {
    let data = null;
    if (url[1]) {
      data = { consumed: url, posParams: { study: url[0], tab: url[1] } };
    } else {
      data = { consumed: url, posParams: { study: url[0] } };
    }
    return data;
  } else {
    return null;
  }
}

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'guides', component: GuidesComponent },
  { path: 'guides/:tab', component: GuidesComponent },
  { path: 'guides/:tab/:section', component: GuidesComponent },

  { path: '', redirectTo: 'console', pathMatch: 'full' },
  { path: 'console', canActivate: [AuthGuard], component: ConsoleComponent },

  {
    path: 'guide/create',
    canActivate: [AuthGuard],
    component: CreateComponent,
  },
  {
    path: 'guide/info/:id',
    canActivate: [AuthGuard],
    component: InfoComponent,
  },
  {
    path: 'guide/upload/:id',
    canActivate: [AuthGuard],
    component: RawUploadComponent,
  },
  {
    path: 'guide/meta/:id',
    canActivate: [AuthGuard],
    component: MetaComponent,
  },
  {
    path: 'guide/assays/:id',
    canActivate: [AuthGuard],
    component: GuidedAssaysComponent,
  },
  {
    path: 'guide/assays/:id/:step',
    canActivate: [AuthGuard],
    component: GuidedAssaysComponent,
  },
  {
    path: 'guide/assays/:id/:step/:substep',
    canActivate: [AuthGuard],
    component: GuidedAssaysComponent,
  },

  { path: 'study/:id', canActivate: [AuthGuard], component: StudyComponent },
  {
    path: 'study/:id/:tab',
    canActivate: [AuthGuard],
    component: StudyComponent,
  },
  { path: 'study', redirectTo: 'console', pathMatch: 'full' },

  { matcher: studyMatcher, component: PublicStudyComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
