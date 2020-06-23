import { Injectable } from "@angular/core";
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from "@angular/router";

import { AuthService } from "./auth.service";

@Injectable()
export class TwitterGuard implements CanActivate {
    router;
    authService;

    static parameters = [AuthService, Router];

    constructor(authService: AuthService, router: Router) {
        this.authService = authService;
        this.router = router;
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.isLoggedIn((is) => {
            if (!is) {
                this.router.navigate(["/"]);
            }
        }, true);
    }
}
