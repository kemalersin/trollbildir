import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from '../../components/auth/auth-guard.service';
import { SpamService } from './spam.service';
import { SpamComponent } from './spam.component';


const SpamRoutes: Routes = [{
    path: 'bildirilenler/:param',
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
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forChild(SpamRoutes),
        TooltipModule.forRoot(),        
        BsDropdownModule.forRoot(),        
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
