import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../../components/auth/auth-guard.service";
import { AuthModule } from "../../components/auth/auth.module";
import { SettingsComponent } from "./settings.component";

import { TooltipModule } from 'ngx-bootstrap/tooltip';

const settingsRoutes: Routes = [
    {
        path: "ayarlar/:tabName",
        component: SettingsComponent,
        canActivate: [AuthGuard],
    },
    {
        path: "ayarlar",
        component: SettingsComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
    imports: [
        AuthModule,
        FormsModule,
        BrowserModule,
        RouterModule.forChild(settingsRoutes),
        TooltipModule.forRoot(),
    ],
    declarations: [SettingsComponent],
    exports: [SettingsComponent],
})
export class SettingsModule {}
