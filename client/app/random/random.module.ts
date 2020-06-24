import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { LinkyModule } from 'ngx-linky';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { AuthGuard } from "../../components/auth/auth-guard.service";

import { RandomComponent } from "./random.component";

const randomRoutes: Routes = [
    {
        path: "rastgele",
        component: RandomComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        RouterModule.forChild(randomRoutes),
        LinkyModule,
        TooltipModule.forRoot(),
    ],
    exports: [RandomComponent],
    declarations: [RandomComponent],
})
export class RandomModule {}
