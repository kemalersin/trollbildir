import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
    router;
    authService;

    static parameters = [AuthService, Router];

    constructor(authService: AuthService, router: Router) {
        this.authService = authService;
        this.router = router;
    }

    canActivate() {
        return this.authService.isLoggedIn((is) => {
            if (!is) {
                this.router.navigate(["/"]);
            }
        });
    }
}
