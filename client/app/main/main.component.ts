import { Component, OnInit } from "@angular/core";

import { redirectUrl } from "../app.constants";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "main",
    template: require("./main.pug"),
    styles: [require("./main.scss")],
})
export class MainComponent implements OnInit {
    isUser;
    isLoggedIn;

    static parameters = [AuthService];

    constructor(private authService: AuthService) {
        this.isLoggedIn = !!authService.getToken();

        this.authService.currentUserChanged.subscribe((user) => {
            this.authService.isLoggedIn().then((is) => {
                this.isLoggedIn = is;

                this.authService.isUser().then((isUser) => {
                    this.isUser = isUser;

                    if (isUser) {
                        setTimeout(() => {
                            window.location.href = redirectUrl;
                        }, 1000 * 5);
                    }
                });
            });
        });
    }

    ngOnInit() {}
}
