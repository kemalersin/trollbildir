import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AuthGuard } from "../../components/auth/auth-guard.service";

import { ListService } from './list.service';
import { ListComponent } from "./list.component";

const listRoutes: Routes = [
    {
        path: "listem/:tabName",
        component: ListComponent,
        canActivate: [AuthGuard],
    },
    {
        path: "listem",
        component: ListComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        RouterModule.forChild(listRoutes),
        InfiniteScrollModule       
    ],
    exports: [ListComponent],
    declarations: [ListComponent],
    providers: [ListService]
})
export class ListModule {}
