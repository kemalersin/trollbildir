import {
    Component,
    ViewChild,
    ElementRef,
    OnInit,
    ANALYZE_FOR_ENTRY_COMPONENTS,
} from "@angular/core";
import { Location } from "@angular/common";
import { finalize } from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";

import { SpamService } from "./spam.service";

@Component({
    selector: "spam",
    template: require("./spam.pug"),
    styles: [require("./spam.scss")],
})
export class SpamComponent implements OnInit {
    username;
    spams: Object[];
    newSpam = "";

    index = 1;
    count = -1;

    @ViewChild("fileInput") fileInput: ElementRef;

    static parameters = [Location, ActivatedRoute, Router, SpamService];

    constructor(
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
        private spamService: SpamService
    ) {
        this.route = route;
        this.router = router;
        this.location = location;
        this.spamService = spamService;
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.username = params.get("username");

            this.spamService.query(this.username).subscribe((spams) => {
                this.spams = spams;

                this.username
                    ? (this.count = spams.length)
                    : this.spamService
                          .count()
                          .subscribe((count) => (this.count = count));
            });
        });
    }

    onScroll() {
        this.spamService
            .query(this.username, ++this.index)
            .subscribe((spams) => {
                this.spams = [...this.spams, ...spams];
            });
    }

    addSpam() {
        if (this.newSpam) {
            let spam = this.newSpam;
            this.newSpam = "";

            return this.spamService.create({ username: spam }).subscribe(
                (spams) => {
                    if (this.username) {
                        return this.router.navigate(["/bildirilenler"]);
                    }

                    if (Array.isArray(spams)) {
                        this.spams = [...spams, ...this.spams];
                        this.count += spams.length;    
                    }
                    else {
                        this.spams.unshift(spams);
                        this.count++;    
                    }
                },
                (res) => {
                    if (res.status === 302) {
                        if (res.error.username) {
                            spam = res.error.username;
                        }

                        return this.router.navigate(["/bildirilenler", spam]);
                    }

                    alert(res.error);
                }
            );
        }
    }

    queue(spam) {
        if (
            !confirm("Kullanıcıyı tekrar bildirmek istediğinize emin misiniz?")
        ) {
            return;
        }

        this.spamService
            .queue(spam)
            .subscribe(() =>
                alert("Kullanıcı tekrar kuyruğa alındı.")
            );
    }

    delete(spam) {
        if (!confirm("Emin misiniz?")) {
            return;
        }

        this.spamService.remove(spam).subscribe((spamedUser) => {
            this.count--;
            this.spams.splice(this.spams.indexOf(spamedUser), 1);
        });
    }
}
