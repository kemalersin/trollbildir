import { NgModule, ApplicationRef, LOCALE_ID } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import {
    removeNgStyles,
    createNewHosts,
    createInputTransfer,
} from "@angularclass/hmr";

import { registerLocaleData } from "@angular/common";
import localeTR from "@angular/common/locales/tr";

registerLocaleData(localeTR, "tr");

import { RouterModule, Routes } from "@angular/router";

import { ToastrModule } from "ngx-toastr";
import { NgxDialogsModule } from "ngx-dialogs";

import { AppComponent } from "./app.component";
import { MainModule } from "./main/main.module";
import { LoginModule } from "./login/login.module";
import { RegisterModule } from "./register/register.module";
import { SettingsModule } from "./settings/settings.module";
import { ClosedModule } from "./closed/closed.module";
import { RandomModule } from "./random/random.module";
import { ListModule } from "./list/list.module";
import { PasswordResetModule } from "./password/password.reset/password.reset.module";

import { DirectivesModule } from "../components/directives.module";

import { JwtModule } from "@auth0/angular-jwt";
import { MembersModule } from "./members/members.module";
import { UsersModule } from "./users/users.module";
import { SpamModule } from "./spam/spam.module";
import { ReportModule } from "./report/report.module";
import { AddReportModule } from "./report/add/add.report.module";

export function tokenGetter() {
    return localStorage.getItem("id_token");
}

const appRoutes: Routes = [
    {
        path: "",
        redirectTo: "/",
        pathMatch: "full",
    },
    { path: "**", redirectTo: "/" },
];

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        JwtModule.forRoot({
            config: {
                tokenGetter,
            },
        }),
        RouterModule.forRoot(appRoutes, {
            enableTracing: process.env.NODE_ENV === "development",
        }),
        MainModule,
        LoginModule,
        RegisterModule, 
        SettingsModule,   
        PasswordResetModule,         
        DirectivesModule,
        MembersModule,
        UsersModule,
        SpamModule,
        ReportModule,
        AddReportModule,
        ClosedModule,
        RandomModule,
        ListModule,        
        NgxDialogsModule,
        ToastrModule.forRoot({
            timeOut: 2500,
            progressBar: true,
            preventDuplicates: true,
            positionClass: "toast-top-center",
        }),
    ],
    declarations: [AppComponent],
    providers: [{ provide: LOCALE_ID, useValue: "tr" }],
    bootstrap: [AppComponent],
})
export class AppModule {
    static parameters = [ApplicationRef];
    constructor(private appRef: ApplicationRef) {
        this.appRef = appRef;
    }

    hmrOnInit(store) {
        if (!store || !store.state) return;

        if ("restoreInputValues" in store) {
            store.restoreInputValues();
        }

        this.appRef.tick();

        Reflect.deleteProperty(store, "state");
        Reflect.deleteProperty(store, "restoreInputValues");
    }

    hmrOnDestroy(store) {
        var cmpLocation = this.appRef.components.map(
            (cmp) => cmp.location.nativeElement
        );
        store.disposeOldHosts = createNewHosts(cmpLocation);

        store.state = { data: "yolo" };

        store.restoreInputValues = createInputTransfer();

        removeNgStyles();
    }

    hmrAfterDestroy(store) {
        store.disposeOldHosts();
        Reflect.deleteProperty(store, "disposeOldHosts");
    }
}
