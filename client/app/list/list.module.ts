import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "../../components/auth/auth-guard.service";

import { ListComponent } from "./list.component";

const listRoutes: Routes = [
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
        RouterModule.forChild(listRoutes)        
    ],
    exports: [ListComponent],
    declarations: [ListComponent],
})
export class ListModule {}
