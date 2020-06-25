import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { finalize } from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";

import { randomCount } from "../app.constants";

import { SpamService } from "../spam/spam.service";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "random",
    template: require("./random.pug"),
    styles: [require("./random.scss")],
})
export class RandomComponent implements OnInit {
    loading;
    isTwitterUser;

    randomCount = randomCount;
    msgHidden = !!localStorage.getItem("trollsavar.hideRandomInfo");

    currentUser = {};

    profiles: Object[] = [];

    AuthService;

    static parameters = [
        HttpClient,
        ToastrService,
        AuthService,
        SpamService,
        Router,
        ActivatedRoute,
    ];

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private authService: AuthService,
        private spamService: SpamService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.AuthService = authService;
        this.spamService = spamService;

        this.route = route;
        this.router = router;
    }

    ngOnInit() {
        this.reset();

        this.authService.currentUserChanged.subscribe((user) => {
            this.currentUser = user;
            this.reset();
        });
    }

    reset() {
        //this.refresh();

        this.authService.isTwitterUser(null, true).then((is) => {
            this.isTwitterUser = is;
        });

        this.AuthService.getCurrentUser().then((user) => {
            this.currentUser = user;
        });
    }

    refresh() {
        this.loading = true;

        this.spamService
            .random()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((profiles) => {
                this.profiles = profiles;
            });
    }

    closeMsg() {
        this.msgHidden = true;
        localStorage.setItem("trollsavar.hideRandomInfo", "true");
    }

    hide(profile, spamed) {
        this.spamService
            .hide(profile, spamed)
            .subscribe((profile) => {
                this.profiles.splice(this.profiles.indexOf(profile), 1);

                if (!this.profiles.length) {
                    this.refresh();
                }
            });
    }
}
