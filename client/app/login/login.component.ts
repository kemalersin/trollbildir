import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";

import { errors, messages } from "../app.constants";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "login",
    template: require("./login.pug"),
})
export class LoginComponent implements OnInit {
    username;
    password;

    captcha;

    return;
    origin;

    submitted;
    validated;

    static parameters = [
        HttpClient,
        ToastrService,
        AuthService,
        Router,
        ActivatedRoute,
    ];

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.route = route;
        this.router = router;
    }

    ngOnInit() {
        this.route.queryParams.subscribe((params) => {
            this.origin = params["return"];
            this.return = this.origin || "/";
        });

        this.resetForm();
    }

    resetSubmit() {
        this.validated = false;
        this.submitted = false;
    }

    resetForm(resetSubmit = true) {
        this.username = null;
        this.password = null;

        if (resetSubmit) {
            this.resetSubmit();
        }
    }

    register() {
        this.router.navigate(["/kayit"], {
            queryParams: {
                return: this.origin,
            },
        });
    }

    login() {
        let error = "";

        if (!(this.username && this.password && this.captcha)) {
            error = errors.missingInformation;
        } else if (this.username.length < 3) {
            error = errors.usernameMinimumLength;
        }

        if (error) {
            this.validated = true;
            return this.toastr.error(error);
        }

        this.submitted = true;

        this.authService
            .login(this.username, this.password, this.captcha)
            .then((user) => {
                if (!user.username) {
                    let usernameInformedCount =
                        Number(localStorage.getItem("trollbildir.usernameInformedCount")) ||
                        0;

                    if (usernameInformedCount < 3) {
                        localStorage.setItem(
                            "trollbildir.usernameInformedCount",
                            String(usernameInformedCount + 1)
                        );

                        this.toastr.info(messages.usernameInform);
                    }
                }

                this.router.navigateByUrl(this.return);
            })
            .catch((res) => {
                this.resetSubmit();
                this.toastr.error(res.error);
            });
    }
}
