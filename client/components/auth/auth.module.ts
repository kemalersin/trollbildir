import { NgModule } from '@angular/core';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { AuthGuard } from '../../components/auth/auth-guard.service';

import { CookieService } from 'ngx-cookie-service';

@NgModule({
    providers: [
        AuthService,
        UserService,
        AuthGuard,
        CookieService
    ]
})
export class AuthModule {}
