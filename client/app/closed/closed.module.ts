import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { LinkyModule } from 'ngx-linky';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from "../../components/auth/auth-guard.service";

import { ClosedComponent } from "./closed.component";

const closedRoutes: Routes = [
    {
        path: "kapatilanlar/:username",
        component: ClosedComponent,
        canActivate: [AuthGuard],
    },    
    {
        path: "kapatilanlar",
        component: ClosedComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        RouterModule.forChild(closedRoutes),
        LinkyModule,
        TooltipModule.forRoot(),        
        InfiniteScrollModule
    ],
    exports: [ClosedComponent],
    declarations: [ClosedComponent],
})
export class ClosedModule {}
