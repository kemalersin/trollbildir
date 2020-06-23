import { Component, OnInit, OnDestroy } from "@angular/core";
import { setInterval, clearInterval } from "timers";

import { redirectUrl } from "../app.constants";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "main",
    template: require("./main.pug"),
    styles: [require("./main.scss")],
})
export class MainComponent implements OnInit, OnDestroy {
    isTwitterUser;

    isLoaded;
    isLoggedIn;

    interval;
    redirect;

    currentUser = {};

    static parameters = [AuthService];

    constructor(private authService: AuthService) {
        this.reset();

        this.authService.currentUserChanged.subscribe((user) => {
            this.currentUser = user;
            this.reset();
        });
    }

    reset() {
        this.authService.isLoggedIn().then((is) => {
            this.isLoaded = true;
            this.isLoggedIn = is;
        });

        this.authService.getCurrentUser().then((user) => {
            this.currentUser = user;
        });

        this.authService.isTwitterUser().then((is) => {
            this.isTwitterUser = is;

            if (is) {
                this.redirect = true;

                this.interval = setInterval(() => {
                    if (this.redirect) {
                        window.location.href = redirectUrl;
                    }
                }, 1000 * 60 * 2);
            }
        });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.redirect = false;

        if (this.interval) {            
            clearInterval(this.interval);
        }
    }
}
