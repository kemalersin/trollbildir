import { Component, OnInit, OnDestroy } from "@angular/core";
import { clearInterval } from "timers";

import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "main",
    template: require("./main.pug"),
    styles: [require("./main.scss")],
})
export class MainComponent implements OnInit, OnDestroy {
    isAdmin;
    isTwitterUser;

    isLoaded;
    isLoggedIn;

    interval;
    redirect;

    currentUser = {};

    static parameters = [AuthService, ToastrService];

    constructor(
        private authService: AuthService,
        private toastr: ToastrService
    ) {
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

            this.isAdmin = is && this.authService.isAdminSync();
            this.isTwitterUser = is && this.authService.isTwitterUserSync();
        });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.toastr.clear();
        this.redirect = false;

        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}
