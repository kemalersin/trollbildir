import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { SpamService } from "../spam/spam.service";

import { safeCb } from "../../components/util";

@Component({
    selector: "closed",
    template: require("./closed.pug"),
})
export class ClosedComponent implements OnInit {
    loading;
    isTwitterUser;

    index = 0;
    count = -1;

    username;
    spams: Object[];

    AuthService;

    static parameters = [
        SpamService,
        Router,
        ActivatedRoute,
    ];

    constructor(
        private spamService: SpamService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.spamService = spamService;

        this.route = route;
        this.router = router;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get("username");

            this.reset();
            this.reload();
        });
    }

    reset() {
        this.index = 0;
        this.count = -1;
        this.spams = [];
    }

    reload() {
        this.getSpams((spams) => {
            this.username
                ? (this.count = spams.length)
                : this.spamService
                      .count(1)
                      .subscribe((count) => (this.count = count));
        });
    }

    getSpams(cb?) {
        this.spamService
            .query(this.username, ++this.index, 1)
            .subscribe((spams) => {
                this.spams =
                    this.spams && this.spams[0]
                        ? [...this.spams, ...spams]
                        : spams;

                safeCb(cb)(spams);
            });
    }

    find() {
        return this.router.navigate(["/kapatilanlar", this.username]);
    }    

    onScroll() {
        this.getSpams();
    }
}
