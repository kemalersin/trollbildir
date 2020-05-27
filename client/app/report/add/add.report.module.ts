import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "../../../components/auth/auth-guard.service";
import { ReportService } from "../report.service";
import { AddReportComponent } from "./add.report.component";

const AddReportRoutes: Routes = [
    {
        path: "bildir",
        component: AddReportComponent,
        canActivate: [AuthGuard],
    }
];

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forChild(AddReportRoutes)
    ],
    declarations: [AddReportComponent],
    exports: [AddReportComponent],
    providers: [ReportService],
})
export class AddReportModule {}
