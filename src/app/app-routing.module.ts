import { NgModule } from '@angular/core';
import { AuthGuard }  from './auth-guard.service';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { ConsoleComponent } from './components/console/console.component';

import { StudyComponent } from './components/study/study.component';

import { PageNotFoundComponent } from './components/shared/errors/page-not-found/page-not-found.component';

import { CreateComponent } from './components/guide/create/create.component';
import { RawUploadComponent } from './components/guide/upload/upload.component';
import { InfoComponent } from './components/guide/info/info.component';
import { MetaComponent } from './components/guide/meta/meta.component';
import { GuidedAssaysComponent } from './components/guide/assays/assays.component';

const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: '', redirectTo: 'console', pathMatch: 'full'},
	{ path: 'console', canActivate: [AuthGuard], component: ConsoleComponent },

	{ path: 'guide/create', canActivate: [AuthGuard], component: CreateComponent },
	{ path: 'guide/info/:id', canActivate: [AuthGuard], component: InfoComponent },
	{ path: 'guide/upload/:id', canActivate: [AuthGuard], component: RawUploadComponent },
	{ path: 'guide/meta/:id', canActivate: [AuthGuard], component: MetaComponent },
	{ path: 'guide/assays/:id', canActivate: [AuthGuard], component: GuidedAssaysComponent },
	{ path: 'guide/assays/:id/:step', canActivate: [AuthGuard], component: GuidedAssaysComponent },
	{ path: 'guide/assays/:id/:step/:substep', canActivate: [AuthGuard], component: GuidedAssaysComponent },

	
	{ path: 'study/:id', canActivate: [AuthGuard], component: StudyComponent },
	{ path: 'study/:id/:tab', canActivate: [AuthGuard], component: StudyComponent },
	{ path: 'study', redirectTo: 'console', pathMatch: 'full'},
	
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
