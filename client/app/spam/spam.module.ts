import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from '../../components/auth/auth-guard.service';
import { SpamService } from './spam.service';
import { SpamComponent } from './spam.component';


const SpamRoutes: Routes = [{
    path: 'bildirilenler/:username',
    component: SpamComponent,
    canActivate: [AuthGuard]
}, {
    path: 'bildirilenler',
    component: SpamComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forChild(SpamRoutes),
        InfiniteScrollModule
    ],
    declarations: [
        SpamComponent
    ],
    exports: [
        SpamComponent
    ],
    providers: [
        SpamService
    ]
})
export class SpamModule { }
