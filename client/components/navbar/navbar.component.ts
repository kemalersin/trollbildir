import { Component } from "@angular/core";

import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

@Component({
    selector: "navbar",
    template: require("./navbar.pug")
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
    isLoggedIn;
    currentUser = {};
    AuthService;

    static parameters = [AuthService, Router];
    constructor(private authService: AuthService, private router: Router) {
        this.AuthService = authService;

        this.Router = router;

        this.reset();

        this.AuthService.currentUserChanged.subscribe((user) => {
            this.currentUser = user;
            this.reset();
        });
    }

    reset() {
        this.AuthService.isLoggedIn().then((is) => {
            this.isLoggedIn = is;
        });

        this.AuthService.isMember().then((is) => {
            this.isMember = is;
        });

        this.AuthService.isAdmin().then((is) => {
            this.isAdmin = is;
        });

        this.AuthService.getCurrentUser().then((user) => {
            this.currentUser = user;
        });
    }

    logout() {
        return this.AuthService.logout().then(() => {
            this.Router.navigateByUrl("/");
            this.reset();
        });
    }
}
