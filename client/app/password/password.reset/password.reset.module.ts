import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { RouterModule, Routes } from "@angular/router";

import { PasswordResetComponent } from "./password.reset.component";
import { CaptchaModule } from '../../../components/captcha/captcha.module';

const passwordResetRoutes: Routes = [
    {
        path: "parolami-unuttum",
        component: PasswordResetComponent,
    },    
    {
        path: "parola-sifirlama/:reset-code",
        component: PasswordResetComponent,
    }    
];

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        CaptchaModule,
        RouterModule.forChild(passwordResetRoutes)        
    ],
    exports: [PasswordResetComponent],
    declarations: [PasswordResetComponent],
})
export class PasswordResetModule {}
