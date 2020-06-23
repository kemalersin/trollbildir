import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { RegisterComponent } from "./register.component";
import { CaptchaModule } from '../../components/captcha/captcha.module';

const registerRoutes: Routes = [
    {
        path: "kayit",
        component: RegisterComponent,
    },
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        CaptchaModule,
        RouterModule.forChild(registerRoutes)        
    ],
    exports: [RegisterComponent],
    declarations: [RegisterComponent],
})
export class RegisterModule {}
