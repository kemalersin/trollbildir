import { Component } from "@angular/core";

import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

import { AuthService } from "../auth/auth.service";

@Component({
    selector: "navbar",
    template: require("./navbar.pug"),
})
export class NavbarComponent {
    isCollapsed = true;

    menu = [
        {
            title: "Ana Sayfa",
            link: "/",
        },
    ];

    Router;

    isAdmin;
    isMember;
    isTwitterUser;

    isLoggedIn;

    currentUser = {};

    AuthService;

    static parameters = [AuthService, Router];
    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        this.AuthService = authService;

        this.Router = router;

        this.reset();

        this.AuthService.currentUserChanged.subscribe((user) => {
            this.currentUser = user;
            this.reset();
        });

        router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.isCollapsed = true;
            });
    }

    reset() {
        this.AuthService.isLoggedIn().then((is) => {
            this.isLoggedIn = is;

            this.isMember = is && this.AuthService.isMemberSync();
            this.isTwitterUser = is && this.AuthService.isTwitterUserSync();
            this.isAdmin = is && this.AuthService.isAdminSync(); 
        });
    }

    logout() {
        return this.AuthService.logout(true).then(() => {
            this.Router.navigateByUrl("/");
            this.reset();
        });
    }
}
