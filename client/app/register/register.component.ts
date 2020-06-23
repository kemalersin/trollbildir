import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";

import { ToastrService } from "ngx-toastr";

import { errors, messages, EMAIL_REGEXP } from "../app.constants";
import { AuthService } from "../../components/auth/auth.service";

@Component({
    selector: "register",
    template: require("./register.pug"),
})
export class RegisterComponent implements OnInit {
    email;
    password;

    captcha;

    origin;
    return;

    submitted;
    validated;

    emailRegExp = EMAIL_REGEXP;

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
        this.email = null;
        this.password = null;

        if (resetSubmit) {
            this.resetSubmit();
        }
    }

    login() {
        this.router.navigate(["/giris"], {
            queryParams: {
                return: this.origin,
            },
        });
    }

    register() {
        let error = "";

        if (!(this.email && this.password && this.captcha)) {
            error = errors.missingInformation;
        } else if (!EMAIL_REGEXP.test(this.email)) {
            error = errors.incorrectEmail;
        }

        if (error) {
            this.validated = true;
            return this.toastr.error(error);
        }

        this.submitted = true;

        this.authService.createUser(
            {
                email: this.email,
                password: this.password,
            },
            this.captcha,
            (res) => {
                if (res && res.error) {
                    this.resetSubmit();
                    this.toastr.error(res.error);

                    return;
                }

                this.toastr.info(messages.usernameInform);
                this.router.navigateByUrl(this.return);
            }
        );
    }
}
