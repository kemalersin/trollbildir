import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { LoginComponent } from "./login.component";
import { CaptchaModule } from '../../components/captcha/captcha.module';

const loginRoutes: Routes = [
    {
        path: "giris",
        component: LoginComponent,
    },
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        CaptchaModule,
        RouterModule.forChild(loginRoutes)        
    ],
    exports: [LoginComponent],
    declarations: [LoginComponent],
})
export class LoginModule {}
