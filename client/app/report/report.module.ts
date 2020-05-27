import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";

import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { AuthGuard } from "../../components/auth/auth-guard.service";
import { ReportService } from "./report.service";
import { ReportComponent } from "./report.component";

const ReportRoutes: Routes = [
    {
        path: "bildirimlerim/:filter",
        component: ReportComponent,
        canActivate: [AuthGuard],
    },
    {
        path: "bildirimlerim",
        component: ReportComponent,
        canActivate: [AuthGuard],
    }
];

@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forChild(ReportRoutes),
        InfiniteScrollModule,
    ],
    declarations: [ReportComponent],
    exports: [ReportComponent],
    providers: [ReportService],
})
export class ReportModule {}
