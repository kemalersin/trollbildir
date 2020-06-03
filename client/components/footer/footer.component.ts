import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { filter } from "rxjs/operators";

@Component({
    selector: "footer",
    template: require("./footer.pug"),
    styles: [require("./footer.scss")],
})
export class FooterComponent {
    perUser;
    daily;
    hidden;

    static parameters = [HttpClient, Router];

    constructor(private http: HttpClient, private router: Router) {
        router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (this.hidden) {
                    return;
                }

                this.http.get("/api/stats").subscribe((res) => {
                    this.perUser = res["perUser"];
                    this.daily = res["daily"];
                });
            });
    }

    hide () {
        this.hidden = true;
    }
}
